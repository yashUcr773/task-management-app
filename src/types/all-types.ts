import { Tag, Task, User, Epic, Sprint, Team } from "@prisma/client";

export interface TasksWithUsersAndTags extends Task {
    creator: User;
    assignee?: User | null;
    tags: Tag[];
    epic?: Epic | null;
    sprint?: Sprint | null;
    team: Team;
}