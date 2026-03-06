from post_processing.stat_accumu import StatFrame

def from_statflow(statflow: list[StatFrame]) -> list[dict]:
    result = []
    for stat in statflow:
        result.append(from_stat_frame(stat))
    return result

def from_stat_frame(stat_frame: StatFrame) -> dict:
    future = {
        "ts": stat_frame.timestamp,
        "score_weighted": stat_frame.score_weighted,
        "score": stat_frame.score_plain,
        "rated_count": stat_frame.rated_count
    }
    return future

def from_refmap_entry(entry: dict) -> dict:
    future = {
        "manuscript_title": entry["manuscript_title"],
        "viscosity": entry["viscosity"],
        "status": entry["status"],
        "created_at": entry["created_at"],
        "author_name": entry["author_name"],
        "user_id": entry["user_id"],
        "institution": entry["institution"],
        "social_media": entry["social_media"],
        "co_authors": entry["co_authors"],
        "special_issue": entry["special_issue"],
        "screened_at": entry["screened_at"],
        "screened_by": entry["screened_by"],
        "screening_notes": entry["screening_notes"],
        "solicited_topic": entry["solicited_topic"],
        "discipline": entry["discipline"],
        "promoted_to_septic_at": entry["promoted_to_septic_at"],
        "promoted_to_stone_at": entry["promoted_to_stone_at"],
        "discipline_user_edited": entry["discipline_user_edited"],
        "hidden": entry["hidden"],
        "hidden_by": entry["hidden_by"],
        "hidden_at": entry["hidden_at"],
        "comment_count": entry["comment_count"],
        "unique_commenters": entry["unique_commenters"],
        "zone": entry["zone"],
        "latrine_recency": entry["latrine_recency"],
        "latrine_sort_key": entry["latrine_sort_key"],
    }
    return future