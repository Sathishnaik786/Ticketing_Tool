import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall } from '@/services/api';
import { ArrowLeft, Box, CheckCircle2, ChevronRight, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface FormField {
  id: string;
  label: string;
  field_type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'CHECKBOX';
  is_required: boolean;
  options: string[] | null;
  field_order: number;
}

interface CatalogItemDetail {
  id: string;
  name: string;
  description: string;
  form: { id: string } | null;
  fields: FormField[];
}

export default function CatalogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<CatalogItemDetail | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketCreated, setTicketCreated] = useState<any>(null);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await apiCall(`/v1/esm/catalog/items/${id}`, 'GET');
        if (response.success && response.data) {
          setItem(response.data);
          
          // Initialize default response state
          const initialResponses: Record<string, any> = {};
          response.data.fields.forEach((field: FormField) => {
            initialResponses[field.id] = field.field_type === 'CHECKBOX' ? false : '';
          });
          setResponses(initialResponses);
        }
      } catch (err: any) {
        toast.error('Failed to load item details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [id]);

  const handleInputChange = (fieldId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    // Validate required fields
    for (const field of item.fields) {
      const val = responses[field.id];
      if (field.is_required && (val === undefined || val === null || val === '')) {
        toast.error(`Field "${field.label}" is required.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const responseList = Object.entries(responses).map(([fieldId, val]) => ({
        field_id: fieldId,
        value: val
      }));

      const result = await apiCall('/v1/esm/catalog/request', 'POST', {
        item_id: item.id,
        responses: responseList
      });

      if (result.success) {
        setSuccess(true);
        setTicketCreated(result.ticket);
        toast.success('Service Request submitted successfully!');
      } else {
        toast.error(result.message || 'Submission failed');
      }
    } catch (err: any) {
      toast.error('Request submission error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="text-muted-foreground text-sm font-medium">Fetching request form schema...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-semibold">Catalog Item not found</h3>
        <button onClick={() => navigate('/app/esm/catalog')} className="mt-4 text-primary font-medium hover:underline">
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/esm/catalog')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Catalog</span>
      </button>

      {success ? (
        <div className="bg-card border border-green-500/20 rounded-3xl p-8 text-center space-y-6 shadow-xl max-w-xl mx-auto animate-fade-in">
          <div className="mx-auto h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Request Submitted Successfully!</h2>
            <p className="text-muted-foreground text-sm">
              Your service request has been mapped to a support ticket and scheduled for workflow execution.
            </p>
          </div>

          {ticketCreated && (
            <div className="bg-accent/40 rounded-2xl p-6 text-left border border-border/40 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-muted-foreground">Ticket ID</span>
                <span className="font-mono text-xs max-w-[200px] truncate">{ticketCreated.id}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-muted-foreground">Title</span>
                <span>{ticketCreated.title}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-muted-foreground">Initial Status</span>
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                  {ticketCreated.status}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => navigate('/app/esm/catalog')}
              className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-semibold transition-all"
            >
              Catalog Directory
            </button>
            {ticketCreated && (
              <button
                onClick={() => navigate(`/app/tickets/${ticketCreated.id}`)}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Track Ticket</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-xl space-y-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Box className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold">{item.name}</h1>
            </div>
            <p className="text-muted-foreground mt-3 text-sm">{item.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {item.fields.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">This request does not require any additional fields.</p>
            ) : (
              item.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-1">
                    <span>{field.label}</span>
                    {field.is_required && <span className="text-red-500 font-bold">*</span>}
                  </label>

                  {/* Text Input */}
                  {field.field_type === 'TEXT' && (
                    <input
                      type="text"
                      required={field.is_required}
                      value={responses[field.id]}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all text-sm"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}

                  {/* Number Input */}
                  {field.field_type === 'NUMBER' && (
                    <input
                      type="number"
                      required={field.is_required}
                      value={responses[field.id]}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all text-sm"
                      placeholder={`Enter numeric ${field.label.toLowerCase()}`}
                    />
                  )}

                  {/* Date Input */}
                  {field.field_type === 'DATE' && (
                    <input
                      type="date"
                      required={field.is_required}
                      value={responses[field.id]}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all text-sm"
                    />
                  )}

                  {/* Select Dropdown */}
                  {field.field_type === 'SELECT' && (
                    <select
                      required={field.is_required}
                      value={responses[field.id]}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all text-sm"
                    >
                      <option value="">Select option...</option>
                      {field.options && field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {/* Checkbox */}
                  {field.field_type === 'CHECKBOX' && (
                    <div className="flex items-center gap-3 py-1">
                      <input
                        type="checkbox"
                        id={field.id}
                        checked={responses[field.id]}
                        onChange={(e) => handleInputChange(field.id, e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-input rounded transition-all"
                      />
                      <label htmlFor={field.id} className="text-sm font-medium select-none cursor-pointer">
                        Check to confirm
                      </label>
                    </div>
                  )}
                </div>
              ))
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 shadow-lg shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Request Form</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
