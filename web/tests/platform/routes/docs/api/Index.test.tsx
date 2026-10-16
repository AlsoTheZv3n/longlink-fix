// @vitest-environment happy-dom
import Page from '@/platform/routes/docs/api/Index';
import { documentationPage } from '../../../../render';

documentationPage(Page, 'Platform', '/docs/api');
