// Section registry: section type -> public renderer. Used by the public pages and the editor canvas
// alike (the canvas never forks renderers; it only adds edit-target attributes via EditContext).
import { lazy, Suspense, type ComponentType } from 'react';
import type { BuiltinSection, BuiltinSectionType, CustomSection as CustomSectionT } from '../../content/types';
import { AboutCertifications, AboutEducation, AboutGoals, AboutHeader, AboutIntro, AboutStats } from './builtin/about';
import {
  AchievementsCommunity,
  AchievementsHackathons,
  AchievementsHeader,
  AchievementsPrograms,
} from './builtin/achievements';
import { ContactHeader, ContactMain } from './builtin/contact';
import { HomeContactCta, HomeCoreStack, HomeHero, HomeHighlights } from './builtin/home';
import { ProjectsHeader, ProjectsList, ProjectsStack } from './builtin/projects';

// Custom sections and their blocks are a separate chunk: the default pages never load it.
// (Import BLOCK_COMPONENTS from '../blocks/CustomSection' directly where needed.)
const CustomSectionImpl = lazy(() => import('../blocks/CustomSection'));

function CustomSection({ section }: { section: CustomSectionT }) {
  return (
    <Suspense fallback={null}>
      <CustomSectionImpl section={section} />
    </Suspense>
  );
}

export type BuiltinSectionComponent = ComponentType<{ section: BuiltinSection }>;

export const SECTION_COMPONENTS: Record<BuiltinSectionType, BuiltinSectionComponent> & {
  custom: ComponentType<{ section: CustomSectionT }>;
} = {
  'home.hero': HomeHero,
  'home.coreStack': HomeCoreStack,
  'home.highlights': HomeHighlights,
  'home.contactCta': HomeContactCta,
  'about.header': AboutHeader,
  'about.intro': AboutIntro,
  'about.goals': AboutGoals,
  'about.stats': AboutStats,
  'about.education': AboutEducation,
  'about.certifications': AboutCertifications,
  'projects.header': ProjectsHeader,
  'projects.stack': ProjectsStack,
  'projects.list': ProjectsList,
  'achievements.header': AchievementsHeader,
  'achievements.hackathons': AchievementsHackathons,
  'achievements.community': AchievementsCommunity,
  'achievements.programs': AchievementsPrograms,
  'contact.header': ContactHeader,
  'contact.main': ContactMain,
  custom: CustomSection,
};

