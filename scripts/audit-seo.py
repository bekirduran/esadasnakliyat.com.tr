"""Audit all built HTML pages without crawling 1,000 live regional pages."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json

class Page(HTMLParser):
 def __init__(self):
  super().__init__(); self.title='';self.in_title=False;self.h1=0;self.canon=[];self.description=[];self.links=[];self.missing_alt=0;self.schema=[];self.in_schema=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='title':self.in_title=True
  if tag=='h1':self.h1+=1
  if tag=='link' and a.get('rel')=='canonical':self.canon.append(a.get('href',''))
  if tag=='meta' and a.get('name')=='description':self.description.append(a.get('content',''))
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag=='img' and 'alt' not in a:self.missing_alt+=1
  if tag=='script' and a.get('type')=='application/ld+json':self.in_schema=True
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='script':self.in_schema=False
 def handle_data(self,data):
  if self.in_title:self.title+=data
  if self.in_schema:self.schema.append(json.loads(data))

root=Path('dist');issues=[];titles={};count=0
for file in sorted(root.rglob('*.html')):
 p=Page();p.feed(file.read_text());count+=1
 route='/'+str(file.relative_to(root)).removesuffix('index.html')
 if file.name=='404.html':continue
 for bad,label in [(not p.title,'missing title'),(p.h1!=1,'H1 count'),(len(p.canon)!=1,'canonical count'),(len(p.description)!=1 or not p.description[0],'description'),(p.missing_alt,'image alt'),(not p.schema,'structured data')]:
  if bad:issues.append([route,label])
 if p.canon and p.canon[0]!='https://esadasnakliyat.com.tr'+route:issues.append([route,'canonical mismatch'])
 if p.title in titles:issues.append([route,'duplicate title',titles[p.title]])
 titles[p.title]=route
 for href in p.links:
  u=urlsplit(href)
  if u.netloc and u.netloc!='esadasnakliyat.com.tr':continue
  if u.scheme and u.scheme not in ['https','http']:continue
  path=unquote(u.path)
  if not path or not path.startswith('/'):continue
  target=root/path.lstrip('/')
  if not (target.is_file() or (target/'index.html').is_file()):issues.append([route,'broken internal link',path])
report={'pages':count,'issues':issues}
print(json.dumps(report,ensure_ascii=False,indent=2))
if issues:raise SystemExit(1)
