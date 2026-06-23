import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { InvoiceItem, ClaimStatus } from '../../types';
import { formatCurrency, formatDate, getInvoiceStatusBadge } from '../../utils/helpers';
import { 
  FileText, 
  DollarSign, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  CreditCard,
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import './BillingView.css';

export const BillingView: React.FC = () => {
  const { invoices, patients, generateInvoice, settleInvoice, addToast } = useApp();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Modal State
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  // Invoice Form State
  const [patientId, setPatientId] = useState('');
  const [discount, setDiscount] = useState('0');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState({ description: '', quantity: '1', unitPrice: '' });
  
  // Insurance details
  const [insProvider, setInsProvider] = useState('');
  const [insPolicy, setInsPolicy] = useState('');
  const [insClaimed, setInsClaimed] = useState('');

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);

  // Stats
  const totalVolume = invoices.reduce((sum, i) => sum + i.total, 0);
  const collected = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0);
  const receivables = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').reduce((sum, i) => sum + i.total, 0);
  const pendingClaims = invoices.filter(i => i.insuranceClaim.status === 'Pending').length;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.description || !newItem.unitPrice) {
      addToast('Description and Unit Price are required.', 'warning');
      return;
    }
    setItems([
      ...items,
      {
        description: newItem.description,
        quantity: parseInt(newItem.quantity) || 1,
        unitPrice: parseFloat(newItem.unitPrice) || 0
      }
    ]);
    setNewItem({ description: '', quantity: '1', unitPrice: '' });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      addToast('Please select a patient.', 'warning');
      return;
    }
    if (items.length === 0) {
      addToast('Please add at least one line item.', 'warning');
      return;
    }

    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      addToast('Selected patient not found.', 'danger');
      return;
    }

    await generateInvoice({
      patientId: patient.id,
      patientName: patient.name,
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 Days Net
      items,
      discount: parseFloat(discount) || 0,
      insuranceClaim: {
        provider: insProvider || 'Self Pay',
        policyNumber: insPolicy || 'N/A',
        amountClaimed: parseFloat(insClaimed) || 0,
        status: insProvider ? 'Pending' : 'N/A'
      },
      status: 'Unpaid'
    });

    // Reset Form
    setShowAddInvoice(false);
    setPatientId('');
    setDiscount('0');
    setItems([]);
    setInsProvider('');
    setInsPolicy('');
    setInsClaimed('');
  };

  const handleReconcilePayment = async (id: string) => {
    await settleInvoice(id, 'Paid', 'Approved');
    addToast(`Invoice ${id} marked as fully settled.`, 'success');
  };

  const handleInsuranceStatus = async (id: string, claimStatus: ClaimStatus) => {
    const isApproved = claimStatus === 'Approved';
    await settleInvoice(id, isApproved ? 'Paid' : 'Unpaid', claimStatus);
    addToast(`Insurance claim for invoice ${id} ${claimStatus.toLowerCase()}.`, 'info');
  };

  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = i.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || i.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="billing-view page-wrapper">
      {/* Metrics board */}
      <div className="grid-4 billing-widgets">
        <div className="stats-card glass-panel flex-row billing-summary-card">
          <div className="widget-icon primary-glow"><DollarSign size={20} /></div>
          <div className="widget-details">
            <span className="label">Total Invoiced</span>
            <span className="value">{formatCurrency(totalVolume)}</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row billing-summary-card">
          <div className="widget-icon green-glow"><CreditCard size={20} /></div>
          <div className="widget-details">
            <span className="label">Collected Revenue</span>
            <span className="value">{formatCurrency(collected)}</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row billing-summary-card">
          <div className="widget-icon danger-glow"><ShieldAlert size={20} /></div>
          <div className="widget-details">
            <span className="label">Receivables Ledger</span>
            <span className="value">{formatCurrency(receivables)}</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row billing-summary-card">
          <div className="widget-icon orange-glow"><FileText size={20} /></div>
          <div className="widget-details">
            <span className="label">Pending Claims</span>
            <span className="value">{pendingClaims} Claims</span>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="view-grid">
        <div className={`list-column ${selectedInvoiceId ? 'drawer-open' : ''}`}>
          <div className="index-controls glass-panel">
            <div className="flex-between header-row">
              <h3>Financial Ledgers & Statements</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddInvoice(true)}>
                <Plus size={14} /> New Invoice
              </button>
            </div>
            
            <div className="filter-row flex-row">
              <div className="search-box">
                <Search size={16} />
                <input 
                  type="text" placeholder="Search invoices, EHR, claim providers..." 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input search-control"
                />
              </div>

              <select 
                className="form-select filter-control"
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Invoices</option>
                <option value="Paid">Settled (Paid)</option>
                <option value="Unpaid">Open (Unpaid)</option>
                <option value="Overdue">Critical (Overdue)</option>
              </select>
            </div>
          </div>

          {/* Table roster */}
          <div className="table-wrapper glass-panel">
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Patient EHR</th>
                    <th>Billed Date</th>
                    <th>Invoice Balance</th>
                    <th>Claim Status</th>
                    <th>Settle Node</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const statusBadge = getInvoiceStatusBadge(inv.status);
                    return (
                      <tr 
                        key={inv.id} 
                        className={selectedInvoiceId === inv.id ? 'active-row' : ''}
                        onClick={() => setSelectedInvoiceId(inv.id)}
                      >
                        <td>
                          <span className="font-bold text-highlight">{inv.id}</span>
                        </td>
                        <td>
                          <div className="pat-meta-cell">
                            <span className="pat-name font-bold">{inv.patientName}</span>
                            <span className="pat-id">ID: {inv.patientId}</span>
                          </div>
                        </td>
                        <td>
                          <span className="bill-date">{formatDate(inv.date, false)}</span>
                        </td>
                        <td>
                          <span className="font-bold text-highlight">{formatCurrency(inv.total)}</span>
                        </td>
                        <td>
                          {inv.insuranceClaim.provider !== 'Self Pay' ? (
                            <div className="claim-status-block">
                              <span className="claim-provider">{inv.insuranceClaim.provider}</span>
                              <span className={`claim-status-badge ${inv.insuranceClaim.status.toLowerCase()}`}>
                                {inv.insuranceClaim.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted">Self-Pay</span>
                          )}
                        </td>
                        <td>
                          <span className={statusBadge.className}>
                            <span className="badge-dot" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td>
                          <button className="icon-btn btn-sm" aria-label="Open Invoice Details">
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="empty-table-cell">
                        No financial statements matched the selectors.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invoice Detail Drawer */}
        {selectedInvoice && (
          <div className="emr-drawer glass-panel">
            <div className="drawer-header flex-between">
              <div>
                <h2>Statement of Account</h2>
                <span className="emr-ref">Reference ID: {selectedInvoice.id}</span>
              </div>
              <button className="close-modal" onClick={() => setSelectedInvoiceId(null)}>×</button>
            </div>

            <div className="drawer-body">
              {/* Patient and details */}
              <div className="emr-profile-card">
                <div className="profile-top flex-between">
                  <div>
                    <h3>{selectedInvoice.patientName}</h3>
                    <p className="pat-core-demographics">EHR Node Reference: {selectedInvoice.patientId}</p>
                  </div>
                  <span className={getInvoiceStatusBadge(selectedInvoice.status).className}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div className="profile-details-grid">
                  <div className="detail-item">
                    <span className="label">Date Generated</span>
                    <span className="value">{formatDate(selectedInvoice.date, false)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment Net Due</span>
                    <span className="value">{formatDate(selectedInvoice.dueDate, false)}</span>
                  </div>
                </div>
              </div>

              {/* Items Breakdown list */}
              <div className="invoice-items-breakdown">
                <h4 className="section-title">Itemized Line Statement</h4>
                <div className="items-list-box">
                  {selectedInvoice.items.map((item, idx) => (
                    <div key={idx} className="invoice-item-row flex-between">
                      <div className="item-desc-cell">
                        <span className="item-desc font-bold text-highlight">{item.description}</span>
                        <span className="item-qty">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</span>
                      </div>
                      <span className="item-total-val font-bold">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="invoice-calculation-summary mt-1">
                  <div className="calc-row flex-between text-xs">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="calc-row flex-between text-xs">
                    <span>Clinical Tax (8%)</span>
                    <span>{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="calc-row flex-between text-xs text-success">
                      <span>Co-pay / Discount</span>
                      <span>-{formatCurrency(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  <div className="calc-row flex-between total-row font-bold text-highlight mt-0-5">
                    <span>Total Due Balance</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Insurance Details */}
              <div className="insurance-ledger-section">
                <h4 className="section-title flex-row"><Sparkles size={16} /> Third Party Payer Coverage</h4>
                <div className="emr-profile-card mt-0-5">
                  <div className="profile-details-grid">
                    <div className="detail-item">
                      <span className="label">Payer Provider</span>
                      <span className="value">{selectedInvoice.insuranceClaim.provider}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Policy Reference</span>
                      <span className="value">{selectedInvoice.insuranceClaim.policyNumber}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Coverage Balance</span>
                      <span className="value">{formatCurrency(selectedInvoice.insuranceClaim.amountClaimed)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Claim Status</span>
                      <span className={`claim-status-badge ${selectedInvoice.insuranceClaim.status.toLowerCase()}`}>
                        {selectedInvoice.insuranceClaim.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions panel */}
              <div className="billing-actions-panel mt-1">
                <button 
                  type="button" 
                  className="btn btn-secondary full-width flex-row mb-0-5"
                  onClick={() => setShowPrintPreview(true)}
                >
                  <FileText size={14} /> Print Medical Statement Invoice
                </button>
                {selectedInvoice.status !== 'Paid' && (
                  <div className="flex-column gap-0-5">
                    <button 
                      className="btn btn-primary full-width flex-row"
                      onClick={() => handleReconcilePayment(selectedInvoice.id)}
                    >
                      <CreditCard size={14} /> Record Manual Cash/Card Payment
                    </button>
                    
                    {selectedInvoice.insuranceClaim.status === 'Pending' && (
                      <div className="grid-2 mt-0-5">
                        <button 
                          className="btn btn-secondary btn-sm flex-row"
                          onClick={() => handleInsuranceStatus(selectedInvoice.id, 'Approved')}
                        >
                          <Check size={12} className="text-success" /> Approve Claim
                        </button>
                        <button 
                          className="btn btn-danger btn-sm flex-row"
                          onClick={() => handleInsuranceStatus(selectedInvoice.id, 'Denied')}
                        >
                          <X size={12} /> Deny Claim
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {selectedInvoice.status === 'Paid' && (
                  <div className="settlement-confirmed flex-row">
                    <Check size={16} /> <span>Transaction Fully Audited & Settle Reconciliation Complete</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Create New Invoice */}
      {showAddInvoice && (
        <div className="modal-overlay flex-row">
          <div className="modal-content glass-panel invoice-modal">
            <div className="modal-header flex-between">
              <h3>Generate Clinical Statement</h3>
              <button className="close-modal" onClick={() => setShowAddInvoice(false)}>×</button>
            </div>
            
            <form onSubmit={handleInvoiceSubmit}>
              <div className="invoice-form-grid">
                <div className="form-group">
                  <label className="form-label">Patient Record *</label>
                  <select 
                    className="form-select" required
                    value={patientId} onChange={(e) => setPatientId(e.target.value)}
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>

                {/* Items creator */}
                <div className="form-items-creator">
                  <span className="form-label">Line Items *</span>
                  
                  {items.length > 0 && (
                    <div className="items-preview-list">
                      {items.map((item, idx) => (
                        <div key={idx} className="preview-item flex-between">
                          <span className="item-name">{item.description} (Qty: {item.quantity} × {formatCurrency(item.unitPrice)})</span>
                          <button 
                            type="button" className="btn-remove-item"
                            onClick={() => handleRemoveItem(idx)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="items-adder flex-row mt-0-5">
                    <input 
                      type="text" className="form-input flex-grow" placeholder="Consultation, lab test, bed charge..."
                      value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    />
                    <input 
                      type="number" className="form-input qty-input" placeholder="Qty" min="1"
                      value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                    />
                    <input 
                      type="number" className="form-input price-input" placeholder="Price" step="0.01"
                      value={newItem.unitPrice} onChange={(e) => setNewItem({...newItem, unitPrice: e.target.value})}
                    />
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Co-pay / Discount ($)</label>
                    <input 
                      type="number" className="form-input" placeholder="0"
                      value={discount} onChange={(e) => setDiscount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Insurance details fields */}
                <div className="insurance-fields-block mt-0-5">
                  <span className="form-label font-bold">Insurance Payer Details</span>
                  <div className="grid-3 mt-0-5">
                    <div className="form-group">
                      <label className="form-label">Provider</label>
                      <input 
                        type="text" className="form-input" placeholder="Aetna, Cigna..."
                        value={insProvider} onChange={(e) => setInsProvider(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Policy ID</label>
                      <input 
                        type="text" className="form-input" placeholder="POL-00000"
                        value={insPolicy} onChange={(e) => setInsPolicy(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cover Amount ($)</label>
                      <input 
                        type="number" className="form-input" placeholder="0.00"
                        value={insClaimed} onChange={(e) => setInsClaimed(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer flex-row mt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddInvoice(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal Overlay */}
      {showPrintPreview && selectedInvoice && (
        <div className="modal-overlay flex-row print-modal-overlay">
          <div className="modal-content glass-panel printable-modal-content">
            <div className="modal-header flex-between no-print-section">
              <h3>Invoice Print Details Preview</h3>
              <div className="flex-row gap-0-5">
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm flex-row"
                  onClick={() => window.print()}
                >
                  <FileText size={12} /> Print Statement
                </button>
                <button className="close-modal" onClick={() => setShowPrintPreview(false)}>×</button>
              </div>
            </div>

            <div className="printable-statement-container">
              {/* Hospital Credentials Header */}
              <div className="print-hospital-header flex-between">
                <div className="hospital-brand">
                  <h1 className="brand-title">CAREPULSE CLINICAL LABS & ER</h1>
                  <p className="brand-subtitle">CarePulse Enterprise Hospital Group Inc.</p>
                  <p className="hospital-contact">100 Medical Plaza, Suite 400, Metro City, NY 10001</p>
                  <p className="hospital-contact">Tel: +1 (555) 019-2831 | billing@carepulse.com</p>
                </div>
                <div className="invoice-meta-info text-right">
                  <div className="print-invoice-title">MEDICAL STATEMENT</div>
                  <div className="meta-line"><strong>Statement Ref:</strong> {selectedInvoice.id}</div>
                  <div className="meta-line"><strong>Date Created:</strong> {formatDate(selectedInvoice.date, false)}</div>
                  <div className="meta-line"><strong>Due Date:</strong> {formatDate(selectedInvoice.dueDate, false)}</div>
                  <div className="meta-line"><strong>Billing Node Status:</strong> {selectedInvoice.status.toUpperCase()}</div>
                </div>
              </div>

              <div className="divider-line" />

              {/* Patient Information */}
              <div className="print-patient-info grid-2">
                <div className="patient-billing-box">
                  <h4 className="box-title">PATIENT INFORMATION</h4>
                  <p className="info-val font-bold">{selectedInvoice.patientName}</p>
                  <p className="info-val">Patient EHR Ref: {selectedInvoice.patientId}</p>
                  <p className="info-val">Address: {patients.find(p => p.id === selectedInvoice.patientId)?.address || 'Address not listed on record'}</p>
                  <p className="info-val">Contact: {patients.find(p => p.id === selectedInvoice.patientId)?.contact}</p>
                </div>
                <div className="insurance-billing-box">
                  <h4 className="box-title">INSURANCE PAYER POLICY</h4>
                  <p className="info-val"><strong>Payer Provider:</strong> {selectedInvoice.insuranceClaim.provider}</p>
                  <p className="info-val"><strong>Policy ID:</strong> {selectedInvoice.insuranceClaim.policyNumber}</p>
                  <p className="info-val"><strong>Amount Cover Claimed:</strong> {formatCurrency(selectedInvoice.insuranceClaim.amountClaimed)}</p>
                  <p className="info-val"><strong>Claim Payer Status:</strong> {selectedInvoice.insuranceClaim.status}</p>
                </div>
              </div>

              {/* Line items table */}
              <table className="printable-invoice-table">
                <thead>
                  <tr>
                    <th>Line Item Description</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.description}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                  <tr className="summary-row">
                    <td colSpan={2} className="no-border" />
                    <td className="text-right font-bold">Subtotal</td>
                    <td className="text-right">{formatCurrency(selectedInvoice.subtotal)}</td>
                  </tr>
                  <tr className="summary-row">
                    <td colSpan={2} className="no-border" />
                    <td className="text-right font-bold">Clinical Tax (8%)</td>
                    <td className="text-right">{formatCurrency(selectedInvoice.tax)}</td>
                  </tr>
                  {selectedInvoice.discount > 0 && (
                    <tr className="summary-row discount-row">
                      <td colSpan={2} className="no-border" />
                      <td className="text-right font-bold text-success">Discount / Co-pay</td>
                      <td className="text-right text-success">-{formatCurrency(selectedInvoice.discount)}</td>
                    </tr>
                  )}
                  <tr className="summary-row total-row">
                    <td colSpan={2} className="no-border" />
                    <td className="text-right font-bold text-highlight">Total Due Balance</td>
                    <td className="text-right font-bold text-highlight">{formatCurrency(selectedInvoice.total)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures block */}
              <div className="print-signatures-block flex-between">
                <div className="signature-box">
                  <div className="signature-line" />
                  <p className="signature-label">Attending MD / Authorized Clinician Signature</p>
                </div>
                <div className="signature-box text-right">
                  <div className="signature-line" />
                  <p className="signature-label">Patient / Guardian Signature</p>
                </div>
              </div>

              {/* Footer */}
              <div className="print-footer text-center">
                <p>Thank you for choosing CarePulse Medical Center. For billing disputes or payment plans, please contact our administrative desk.</p>
                <p className="audit-detail">Digital Security Key: SHA-256/{selectedInvoice.id.toUpperCase()}/{new Date(selectedInvoice.date).getTime()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BillingView;
