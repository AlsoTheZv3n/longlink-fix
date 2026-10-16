// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Pagination } from '@/components/ui/Pagination';

it('preserves the selected page in its accessible navigation state', () => {
    // Act
    const output = renderStatic(<Pagination page={2} totalItems={75} pageSize={25} onPageChange={() => undefined} />);

    // Assert
    expect(output.querySelector('[aria-current="page"]')?.textContent).toContain('2');
});
