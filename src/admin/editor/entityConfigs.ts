// Collection -> entity config (forms, schemas, blanks) reused from the list editors.
import type { CollectionName } from '../../content/types';
import type { EntityConfig } from '../collection/types';
import { achievementConfig, programConfig, roleConfig } from '../entities/activities';
import { certificationConfig, educationConfig, milestoneConfig } from '../entities/credentials';
import { projectConfig } from '../entities/projects';
import { projectCategoryConfig, socialConfig, techCategoryConfig, technologyConfig } from '../entities/taxonomy';
import type { CollectionKey } from '../lib/reducers';

export const ENTITY_CONFIGS: { [K in CollectionName]: EntityConfig<K & CollectionKey> } = {
  projects: projectConfig,
  technologies: technologyConfig,
  techCategories: techCategoryConfig,
  projectCategories: projectCategoryConfig,
  socials: socialConfig,
  achievements: achievementConfig,
  roles: roleConfig,
  programs: programConfig,
  certifications: certificationConfig,
  education: educationConfig,
  academicPathway: milestoneConfig,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const configFor = (coll: CollectionName) => ENTITY_CONFIGS[coll] as unknown as EntityConfig<any>;
