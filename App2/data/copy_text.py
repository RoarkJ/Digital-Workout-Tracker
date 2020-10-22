from lxml import etree as ET, objectify
from os import listdir
from os.path import isfile, join
import pandas as pd
from collections import OrderedDict
from datetime import date

# def tcxParse(tcxFile):
parser = ET.XMLParser(remove_blank_text=True)
tree = ET.parse('C:/Users/bbahaneb/Documents/DU Data Bootcamp/Digital-Workout-Tracker/data/tcx/activity_3596324_speed_work.tcx', parser)
root = tree.getroot()
# root.tag
# root.attrib

for child in root.getiterator():
    if not hasattr(child.tag, 'find'): continue  # (1)
    i = child.tag.find('}')
    if i >= 0:
        child.tag = child.tag[i + 1:]
objectify.deannotate(root, cleanup_namespaces=True)

trackpoints = [{
    'HR': tp.findtext('HeartRateBpm/Value'),
    'Time': tp.findtext('Time'),
    'Speed': tp.findtext('Extensions/TPX/Speed'),
    'Cadence': tp.findtext('Extensions/TPX/RunCadence'),
    'Lat': tp.findtext('Position/LatitudeDegrees'),
    'Lon': tp.findtext('Position/LongitudeDegrees'),
    'Alt': tp.findtext('AltitudeMeters'),
    'Distance': tp.findtext('DistanceMeters')
    }
for tp in tree.xpath('//Track/Trackpoint')]

trackpt_df = pd.DataFrame(trackpoints)
trackpt_df




