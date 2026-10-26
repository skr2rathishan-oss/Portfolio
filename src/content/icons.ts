// Maps content icon names / social platforms to lucide-react components.
import {
  Bot, BookOpen, Briefcase, Cloud, Code2, Cpu, Database, Facebook, Github, Globe, GraduationCap, Instagram,
  Languages, Layers, Link as LinkIcon, Linkedin, Mail, MapPin, Newspaper, PenSquare, Server, Shield, Smartphone,
  Sparkles, Terminal, Twitter, Wrench, Youtube, type LucideIcon,
} from 'lucide-react';
import type { IconName, SocialPlatform } from './types';

export const ICONS: Record<IconName, LucideIcon> = {
  Bot,
  Cpu,
  Globe,
  Wrench,
  Database,
  Layers,
  Code2,
  Server,
  Cloud,
  Smartphone,
  Shield,
  MapPin,
  BookOpen,
  GraduationCap,
  Languages,
  Briefcase,
  Sparkles,
  Terminal,
};

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export const SOCIAL_ICONS: Record<SocialPlatform, LucideIcon> = {
  email: Mail,
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  facebook: Facebook,
  x: Twitter,
  youtube: Youtube,
  medium: Newspaper,
  devto: PenSquare,
  ieee: Shield,
  website: Globe,
  university: BookOpen,
  location: MapPin,
  other: LinkIcon,
};

export function getIcon(name: IconName | undefined): LucideIcon {
  return (name && ICONS[name]) || Sparkles;
}
