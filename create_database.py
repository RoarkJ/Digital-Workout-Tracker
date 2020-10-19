# Import dependencies
from lxml import etree as ET, objectify
from os import listdir
from os.path import isfile, join, dirname
import pandas as pd
from collections import OrderedDict
from datetime import date
import json
from glob import glob
import fnmatch
from pathlib import Path
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, BigInteger
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.schema import ForeignKey
import psycopg2
import tcxparser

Base = declarative_base()

class Activities(Base):
    __tablename__ = 'activities'
    act_id = Column(BigInteger, primary_key=True)
    act_type = Column(String)
    act_duration = Column(Float)
    act_tot_distance = Column(Float)
    act_max_speed = Column(Float)
    act_avg_hrt_rate = Column(Integer)
    act_max_hrt_rate = Column(Integer)
    act_calories = Column(Integer)
    
class Track_Data_Points(Base):
    __tablename__ = 'track_data_points'
    tr_id = Column(BigInteger, primary_key=True)
    act_id = Column(BigInteger, ForeignKey("activities.act_id"))
    tr_time = Column(String)
    tr_latitude = Column(Float)
    tr_longtitude = Column(Float)
    tr_hrt_rate = Column(Integer)
    tr_speed = Column(Float)
    tr_altitude = Column(Float)
    tr_distance = Column(Float)


engine = create_engine("DB PATH STRING")
conn = engine.connect()

session = Session(bind=engine)

trackpoint_id = 1
count=1
for subdir, dirs, files in os.walk("/Users/loganbon/Documents/GitHub/Projects/School-Projects/Digital-Workout-Tracker/Digital-Workout-Tracker/data/tcx"):
    for filename in files:
        filepath = subdir + os.sep + filename
        print(count)
        count+=1
        with open(filepath):
            try:
                # Parse tcx file 
                parser = ET.XMLParser(remove_blank_text=True)
                tree = ET.parse(filepath, parser)
                root = tree.getroot()
                for child in root.getiterator():
                    if not hasattr(child.tag, 'find'): continue  # (1)
                    i = child.tag.find('}')
                    if i >= 0:
                        child.tag = child.tag[i + 1:]
                objectify.deannotate(root, cleanup_namespaces=True)
                
                # Get activity id from file name
                activity_id = filepath.split("_")
                try:
                    activity_id = int(activity_id[1])
                except:
                    activity_id = int(activity_id[1].split(".")[0])
                
                # Get activity summary data
                tcx = tcxparser.TCXParser(filepath)

                # Finding summary heart rate values, if hrt rate = 0 it will return ZeroDivisionError
                try:
                    avg_hrt_rate = int(tcx.hr_avg)
                    max_hrt_rate = int(tcx.hr_max)
                except ZeroDivisionError:
                    avg_hrt_rate = 0
                    max_hrt_rate = 0
                
                # Adding activities row
                session.add(Activities(act_id=activity_id, \
                                    act_type=tcx.activity_type, \
                                    act_duration=int(tcx.duration), \
                                    act_tot_distance=int(tcx.distance), \
                                    act_max_speed=1, \
                                    act_calories=int(tcx.calories), \
                                    act_avg_hrt_rate=avg_hrt_rate, \
                                    act_max_hrt_rate=max_hrt_rate))
                session.commit()
                
                # Adding trackpoints rows
                for tp in tree.xpath("//Track/Trackpoint"):
                    
                    # Avoiding errors if no lat/long values
                    try:
                        lat=float(tp.findtext('Position/LatitudeDegrees'))
                    except:
                        lat=0
                    try:
                        long=float(tp.findtext('Position/LongitudeDegrees'))
                    except:
                        long=0
                    try:
                        hrt_rate=int(tp.findtext('HeartRateBpm/Value'))
                    except:
                        hrt_rate=0
                    try:
                        speed=float(tp.findtext('Extensions/TPX/Speed'))
                    except:
                        speed=0
                    try:
                        alt=float(tp.findtext('AltitudeMeters'))
                    except:
                        alt=0
                    try:
                        distance=float(tp.findtext('DistanceMeters'))
                    except:
                        distance=0
                    try:
                        time=tp.findtext('Time')
                    except:
                        time=0
                        
                    trackpoint = Track_Data_Points(tr_id=trackpoint_id, \
                                                act_id=activity_id, \
                                                tr_time=time, \
                                                tr_latitude=lat, \
                                                tr_longtitude=long, \
                                                tr_hrt_rate=hrt_rate, \
                                                tr_speed=speed, \
                                                tr_altitude=alt, \
                                                tr_distance=distance)
                    session.add(trackpoint)
                    trackpoint_id+=1
                
                session.commit()
            except:
                pass