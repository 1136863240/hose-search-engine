from django.http import JsonResponse
import jieba
import os
import json
from . import global_vars

# 递归获取所有文件
def get_all_files(path):
    files = []
    for file in os.listdir(path):
        file_path = os.path.join(path, file)
        if os.path.isfile(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                files.append(file_path)
        elif os.path.isdir(file_path):
            files.extend(get_all_files(file_path))
    return files

def lex(request):
    lex_path_str = request.POST.get('lex_path')
    lex_path_list = []
    if lex_path_str is None:
        return JsonResponse({'status': 'error','message': 'lex_path not found'}, status=500)
    lex_path_list = lex_path_str.split('|:|')
    for path in lex_path_list:
        if len(path) == 0:
            continue
        if not os.path.exists(path):
            return JsonResponse({'status': 'error','message': f'{path} not found'}, status=500)
    
    jieba.enable_paddle()
    invert_index = {}
    for path in lex_path_list:
        if len(path) == 0:
            continue
        print(f'Prepare lex file:{path}...')
        files = get_all_files(path)
        index = 0
        count = len(files)
        for file in files:
            index += 1
            print(f'Processing file {index}/{count}:{file}')
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    for line in f.readlines():
                        _words = jieba.cut(line, cut_all=True)
                        for word in _words:
                            if word in {
                                '', ' ', '\n', '\t', '\r', '`', '~', '!', '@', '#', '$', '%', '^', '&', '*',
                                '(', ')', '-', '_', '+', '=', '[', ']', '{', '}', '|', '\\', ';', ':', '\'',
                                '"', ',', '<', '>', '.', '?', '/', '()'
                            }:
                                continue
                            if word not in invert_index:
                                invert_index[word] = set()
                            invert_index[word].add(file)
            except:
                print(f'Add error: {file}')
                continue

    for word in invert_index:
        invert_index[word] = list(invert_index[word])
    return JsonResponse(invert_index)


def add(request):
    json_str = request.POST.get('dict')
    if json_str is None:
        return JsonResponse({'status': 'error','message': 'dict not found'}, status=500)
    _json = json.loads(json_str)
    for parent_i, parent_json in _json.items():
        if parent_i not in global_vars.datas:
            global_vars.datas[parent_i] = set()
        for sub_json in parent_json:
            global_vars.datas[parent_i].add(sub_json)
    return JsonResponse({'status':'success'})


def search(request):
    q = request.GET.get('q')
    page = request.GET.get('page')
    if q is None:
        return JsonResponse({'status': 'error','message': 'q not found'}, status=500)
    if page is None:
        return JsonResponse({'status': 'error','message': 'page not found'}, status=500)
    
    page = int(page)
    page_size = 20
    start = (page - 1) * page_size
    end = page * page_size

    datas_len = len(global_vars.datas)
    if start > datas_len:
        start = datas_len
    if end > datas_len:
        end = datas_len
    
    words = jieba.cut(q, cut_all=True)
    result = {}
    for word in words:
        if word in global_vars.datas:
            if word not in result:
                result[word] = []
            result[word].extend(list(global_vars.datas[word]))
    
    pre_ret = set()
    ret = []
    for value in result.values():
        pre_ret.update(value)
    ret = list(pre_ret)[start:end]
    return JsonResponse({'total': len(pre_ret), 'data': ret})
