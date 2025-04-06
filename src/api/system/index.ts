import { Alova } from '@/utils/http/alova';
import { createApis, withConfigType } from './createApis';

export const alovaInstance = Alova;

export const $$userConfigMap = withConfigType({});

const Apis = createApis(alovaInstance, $$userConfigMap);

export default Apis;
