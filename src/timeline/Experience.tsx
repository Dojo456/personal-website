import { FC } from "react";

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
    return <>{JSON.stringify(props.experience)}</>;
};
