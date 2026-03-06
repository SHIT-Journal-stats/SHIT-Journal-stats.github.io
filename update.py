import json,pickle,os,time
import pusher
from Configuration import _DEFAULT_CONFIGURATION
from post_processing.stat_accumu import StatFlowDataset,StatFrame,_MISSING_NO_STATIC_FRAME
from post_processing.stat_json import from_statflow,from_refmap_entry

def fetch_dataset() -> StatFlowDataset:
    with open(file=config.pth_to_raw_dataset, mode="rb") as raw_dataset:
        latest: StatFlowDataset = pickle.load(raw_dataset)
    return latest

config = _DEFAULT_CONFIGURATION
dataset = fetch_dataset()

def get_ids() -> list[str]:
    global config,dataset
    return list(dataset.dataset.keys())

ids = get_ids()

def get_stat_by_id(idd: str) -> list[StatFrame]:
    global config,dataset
    idd = idd.lower()
    if idd in get_ids():
        return dataset.dataset[idd]
    print(f"warn-No such id: {idd}")
    return [_MISSING_NO_STATIC_FRAME]

def update_all_preprints():
    global config,ids
    for idx,idd in enumerate(ids):
        os.system("cls")
        print(f"updating preprint: {idd}, {idx+1}/{len(ids)} ({(idx/len(ids))*100}%)")
        statflow: list[StatFrame]=get_stat_by_id(idd)
        with open(file=os.path.join(config.pth_to_endpoint_root,"data",idd+".json"), mode="w") as target_file:
            json.dump(from_statflow(statflow), target_file)

def update_metainf():
    global config,ids
    with open(config.pth_to_refmap, 'r') as f:
        refmap: dict[str, dict] = json.loads(f.read())
    for idx,idd in enumerate(ids):
        os.system("cls")
        print(f"updating metainfo: {idd}, {idx + 1}/{len(ids)} ({(idx / len(ids)) * 100}%)")
        if idd in refmap:
            entry = refmap[idd]
            with open(file=os.path.join(config.pth_to_endpoint_root,"meta",idd+".json"), mode="w") as target_file:
                json.dump(from_refmap_entry(entry), target_file)

def push_to_github():
    global config
    pusher.auto_push(os.path.join(config.pth_to_endpoint_root,"..",".git"))

if __name__ == "__main__":
    #update_all_preprints()
    #update_metainf()
    #time.sleep(2)
    push_to_github()