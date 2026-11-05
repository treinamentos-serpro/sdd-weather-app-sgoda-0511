import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

afterEach(cleanup);

describe('SearchBar', () => {
  it.each(['', '   '])('não dispara onSearch para input %j', async (value) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} disabled={false} />);
    const input = screen.getByLabelText('Cidade');
    const button = screen.getByRole('button', { name: 'Buscar' });

    await user.click(input);
    if (value) {
      await user.type(input, value);
    }
    await user.keyboard('{Enter}');
    await user.click(button);

    expect(button).toBeDisabled();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it.each(['clique', 'Enter'])('envia o termo sem espaços externos por %s', async (submit) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} disabled={false} />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), ' São Paulo ');
    if (submit === 'clique') {
      await user.click(screen.getByRole('button', { name: 'Buscar' }));
    } else {
      await user.keyboard('{Enter}');
    }

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it('bloqueia a busca quando disabled está ativo', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} disabled />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    const button = screen.getByRole('button', { name: 'Buscar' });

    await user.type(input, 'São Paulo');
    await user.click(button);

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(onSearch).not.toHaveBeenCalled();
  });
});
