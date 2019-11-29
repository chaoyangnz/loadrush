import { runner } from '../src';
// import './scenarios/sample';
import './scenarios/composer-story-flow';
import './scenarios/composer-image-flow';
import { getEnv } from '../src/loadflux/util';

runner.sustain(getEnv('COMPOSER_USERS', 100));
