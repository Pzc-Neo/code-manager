import shelve

with shelve.open('./neo_web/data/basic_data') as file:
    for i in file:
        print(i,file[i])
