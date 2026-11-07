import os
import json
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Join request.json and task.json on the "Request" field and export to @master-order.json'

    def handle(self, *args, **kwargs):
        # Define paths
        base_dir = settings.BASE_DIR
        input_dir = os.path.join(base_dir, 'static', 'json', 'marketplace', 'orders')
        output_file = os.path.join(input_dir, '@master-order.json')

        request_path = os.path.join(input_dir, 'request.json')
        task_path = os.path.join(input_dir, 'task.json')

        # Load data
        with open(request_path, 'r', encoding='utf-8') as f:
            requests = json.load(f)

        with open(task_path, 'r', encoding='utf-8') as f:
            tasks = json.load(f)

        # Index tasks by Request ID
        task_map = {}
        for task in tasks:
            req_id = task.get('Request')
            if req_id:
                task_map.setdefault(req_id, []).append(task)

        # Join data, excluding requests with no matching tasks
        joined_data = []
        for req in requests:
            req_id = req.get('Request')
            if req_id and req_id in task_map:
                req['Tasks'] = task_map[req_id]
                joined_data.append(req)

        # Ensure output directory exists
        os.makedirs(input_dir, exist_ok=True)

        # Write output
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(joined_data, f, indent=2)

        self.stdout.write(self.style.SUCCESS(f'Successfully created {output_file}'))











# import os
# import json
# from django.core.management.base import BaseCommand
# from django.conf import settings

# class Command(BaseCommand):
#     help = 'Join request.json and sc_task.json on the "Request" field and export to @master-order.json'

#     def handle(self, *args, **kwargs):
#         # Define paths
#         base_dir = settings.BASE_DIR
#         input_dir = os.path.join(base_dir, 'static', 'json', 'marketplace', 'orders')
#         output_file = os.path.join(input_dir, '@master-order.json')

#         request_path = os.path.join(input_dir, 'request.json')
#         task_path = os.path.join(input_dir, 'task.json')

#         # Load data
#         with open(request_path, 'r', encoding='utf-8') as f:
#             requests = json.load(f)

#         with open(task_path, 'r', encoding='utf-8') as f:
#             tasks = json.load(f)

#         # Index tasks by Request ID
#         task_map = {}
#         for task in tasks:
#             req_id = task.get('Request')
#             if req_id:
#                 task_map.setdefault(req_id, []).append(task)

#         # Join data
#         joined_data = []
#         for req in requests:
#             req_id = req.get('Request')
#             if req_id and req_id in task_map:
#                 req['Tasks'] = task_map[req_id]
#             else:
#                 req['Tasks'] = []
#             joined_data.append(req)

#         # Ensure output directory exists
#         os.makedirs(input_dir, exist_ok=True)

#         # Write output
#         with open(output_file, 'w', encoding='utf-8') as f:
#             json.dump(joined_data, f, indent=2)

#         self.stdout.write(self.style.SUCCESS(f'Successfully created {output_file}'))