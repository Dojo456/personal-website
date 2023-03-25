enum ExperienceType {
    Work,
    Education,
}

export type Experience = {
    type: ExperienceType;
    org: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
};

export const asExperience = (data: any) => {
    const exp = data as Experience;

    exp.endDate = data.endDate.toDate();
    exp.startDate = data.startDate.toDate();

    return exp;
};
