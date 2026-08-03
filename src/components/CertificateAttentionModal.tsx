import type { CertificateExpirationStatus } from '../utils/formatters';
import { Button } from './ui';
import { Actions, AttentionBackdrop, AttentionDialog, AttentionHead, AttentionTableWrap } from './CertificateAttentionModal.styles';

export interface CertificateAttentionItem {
  detail: string;
  document?: string;
  id: string;
  name: string;
  status: CertificateExpirationStatus;
}

interface CertificateAttentionModalProps {
  items: CertificateAttentionItem[];
  message: string;
  open: boolean;
  primaryLabel: string;
  title?: string;
  onClose: () => void;
  onPrimary: () => void;
}

export function CertificateAttentionModal({
  items,
  message,
  open,
  primaryLabel,
  title = 'Atencao',
  onClose,
  onPrimary,
}: CertificateAttentionModalProps) {
  if (!open || !items.length) {
    return null;
  }

  return (
    <AttentionBackdrop role="presentation">
      <AttentionDialog role="dialog" aria-modal="true" aria-labelledby="certificate-attention-title">
        <AttentionHead>
          <h2 id="certificate-attention-title">{title}</h2>
        </AttentionHead>
        <div>
          <p>{message}</p>
          <AttentionTableWrap>
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Vencimento</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      {item.document ? <small>{item.document}</small> : null}
                    </td>
                    <td>
                      <span data-status={item.status}>{item.detail}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AttentionTableWrap>
          <Actions>
            <Button type="button" onClick={onPrimary}>
              {primaryLabel}
            </Button>
            <Button type="button" $tone="ghost" onClick={onClose}>
              Resolver depois
            </Button>
          </Actions>
        </div>
      </AttentionDialog>
    </AttentionBackdrop>
  );
}
