import { BUILT_IN_TEMPLATE_IDS } from "../stores/noteStore";

// Built-in templates with their translation keys
export interface BuiltInTemplate {
  id: string;
  titleKey: string;
  contentKey: string;
}

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: BUILT_IN_TEMPLATE_IDS.SHOPPING_LIST,
    titleKey: "templateShoppingListTitle",
    contentKey: "templateShoppingListContent",
  },
  {
    id: BUILT_IN_TEMPLATE_IDS.WEEKLY_TASKS,
    titleKey: "templateWeeklyTasksTitle",
    contentKey: "templateWeeklyTasksContent",
  },
  {
    id: BUILT_IN_TEMPLATE_IDS.MEETING_NOTES,
    titleKey: "templateMeetingNotesTitle",
    contentKey: "templateMeetingNotesContent",
  },
  {
    id: BUILT_IN_TEMPLATE_IDS.PACKING_LIST,
    titleKey: "templatePackingListTitle",
    contentKey: "templatePackingListContent",
  },
  {
    id: BUILT_IN_TEMPLATE_IDS.PROJECT_CHECKLIST,
    titleKey: "templateProjectChecklistTitle",
    contentKey: "templateProjectChecklistContent",
  },
];

// Helper function to get built-in template content with translations
export function getBuiltInTemplateContent(
  templateId: string,
  t: (key: string) => string
): { title: string; content: string } | null {
  const template = BUILT_IN_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return null;

  return {
    title: t(template.titleKey),
    content: t(template.contentKey),
  };
}
