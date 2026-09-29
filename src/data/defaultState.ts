import { AtlasAppState } from '../types/atlas';
import { ProfileService } from '../services/profileService';

export function getInitialDefaultState(): AtlasAppState {
  return ProfileService.getDemoState();
}
