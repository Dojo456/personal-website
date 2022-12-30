import { FC, useEffect, useState } from "react";

enum ExperienceType {
    Work,
    Education,
}

export type Experience = {
    type: ExperienceType;
    org: string;
    title: string;
    startDate: Date;
    endDate: Date;
};

interface ExperienceDisplayProps {
    experience: Experience;
}

export const ExperienceDisplay: FC<ExperienceDisplayProps> = (props) => {
    const [experiences, setExperiences] = useState<Experience[]>([]);

    useEffect(() => {
        fetch("https://api.github.com/users/Dojo456/repos")
            .then((resp) => {
                resp.json().then((resp) => {
                    console.log(resp);
                });
            })
            .catch((err) => console.error(err));
    }, []);

    return <>{JSON.stringify(props.experience)}</>;
};
