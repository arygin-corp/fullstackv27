import xml.etree.ElementTree as ET
NS={'bpmn':'http://www.omg.org/spec/BPMN/20100524/MODEL'}
class BPMNService:
 @staticmethod
 def parse(xml_text):
  root=ET.fromstring(xml_text);nodes=[];flows=[]
  for tag,kind in [('startEvent','start'),('endEvent','end'),('userTask','user_task'),('serviceTask','service_task'),('exclusiveGateway','gateway')]:
   for e in root.findall('.//bpmn:'+tag,NS):nodes.append({'id':e.attrib['id'],'name':e.attrib.get('name',''),'kind':kind})
  for e in root.findall('.//bpmn:sequenceFlow',NS):flows.append({'id':e.attrib['id'],'source':e.attrib['sourceRef'],'target':e.attrib['targetRef'],'name':e.attrib.get('name','')})
  return {'nodes':nodes,'flows':flows}
 @staticmethod
 def export(definition):
  root=ET.Element('definitions',xmlns=NS['bpmn']);process=ET.SubElement(root,'process',id=definition.key)
  for s in definition.states.all(): ET.SubElement(process,'endEvent' if s.is_terminal else ('startEvent' if s.is_initial else 'userTask'),id=s.key,name=s.name)
  for t in definition.transitions.all(): ET.SubElement(process,'sequenceFlow',id=t.key,sourceRef=t.source.key,targetRef=t.target.key,name=t.name)
  return ET.tostring(root,encoding='unicode')
