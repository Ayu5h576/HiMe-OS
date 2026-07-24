import { Project } from '@prisma/client';

export class ProjectPromptFormatter {
  static formatProjectContext(project: Project): string {
    const parts = [
      `Project Name: ${project.name}`,
      project.description ? `Project Description: ${project.description}` : null,
      project.color ? `Project Color: ${project.color}` : null,
      project.icon ? `Project Icon: ${project.icon}` : null,
    ].filter(Boolean);

    return parts.join('\n');
  }
}
