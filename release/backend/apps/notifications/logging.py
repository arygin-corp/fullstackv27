import json, logging
from datetime import datetime, timezone
class JsonFormatter(logging.Formatter):
    RESERVED={"args","asctime","created","exc_info","exc_text","filename","funcName","levelname","levelno","lineno","module","msecs","message","msg","name","pathname","process","processName","relativeCreated","stack_info","thread","threadName"}
    def format(self,record):
        payload={"timestamp":datetime.now(timezone.utc).isoformat(),"level":record.levelname,"logger":record.name,"message":record.getMessage()}
        for key,value in record.__dict__.items():
            if key not in self.RESERVED and not key.startswith("_"):
                try: json.dumps(value,default=str); payload[key]=value
                except Exception: payload[key]=str(value)
        if record.exc_info: payload["exception"]=self.formatException(record.exc_info)
        return json.dumps(payload,separators=(",",":"),default=str)
