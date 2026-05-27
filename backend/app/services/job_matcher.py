def match_resume_to_job(
    resume_skills,
    target_skills
):

    resume_set = set(
        [skill.lower() for skill in resume_skills]
    )

    target_set = set(
        [skill.lower() for skill in target_skills]
    )

    matched_skills = list(
        resume_set.intersection(target_set)
    )

    missing_skills = list(
        target_set - resume_set
    )

    # Match percentage
    if len(target_set) == 0:
        match_score = 0
    else:
        match_score = int(
            (len(matched_skills) / len(target_set)) * 100
        )

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
    }