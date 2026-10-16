import { documentationPage } from '../../../render';
// @vitest-environment happy-dom
import Page from '@/platform/routes/docs/Introduction';

documentationPage(Page, 'Why LongLink', '/docs/introduction');
