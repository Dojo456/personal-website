enum ExperienceType {
    Work,
    Education,
}

export type Experience = {
    org?: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    link?: string;
};

export const asExperience = (data: any) => {
    const exp = data as Experience;

    exp.endDate = data.endDate.toDate();
    exp.startDate = data.startDate.toDate();

    return exp;
};
