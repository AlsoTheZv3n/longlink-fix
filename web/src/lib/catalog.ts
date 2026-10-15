import catalog from '../../../sdk/longlink/.static/jsx/components.json';

// Keep CLI discovery metadata out of the website's catalog contract.
export default catalog.components.map(({ keywords: _keywords, guidance: _guidance, ...component }) => component);
