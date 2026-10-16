// @vitest-environment happy-dom
import Page from '@/platform/routes/docs/Index';
import { documentationPage } from '../../../render';

documentationPage(Page, 'Documentation', '/docs');
