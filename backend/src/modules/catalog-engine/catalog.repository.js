const { supabaseAdmin } = require('../../lib/supabase');

const getCategories = async (tenantId) => {
  const { data, error } = await supabaseAdmin
    .from('service_catalog_categories')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return data;
};

const getItemsByCategory = async (tenantId, categoryId) => {
  const { data, error } = await supabaseAdmin
    .from('service_catalog_items')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('category_id', categoryId)
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return data;
};

const getItemWithFormFields = async (tenantId, itemId) => {
  const { data: item, error: itemError } = await supabaseAdmin
    .from('service_catalog_items')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', itemId)
    .maybeSingle();

  if (itemError) throw new Error(itemError.message);
  if (!item) return null;

  const { data: forms, error: formError } = await supabaseAdmin
    .from('service_catalog_forms')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('item_id', itemId);

  if (formError) throw new Error(formError.message);

  const form = forms[0] || null;
  let fields = [];

  if (form) {
    const { data: fieldData, error: fieldError } = await supabaseAdmin
      .from('service_catalog_form_fields')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('form_id', form.id)
      .order('field_order', { ascending: true });

    if (fieldError) throw new Error(fieldError.message);
    fields = fieldData;
  }

  return {
    ...item,
    form,
    fields
  };
};

const createServiceRequest = async (requestData) => {
  const { tenant_id, item_id, ticket_id, requested_by, responses } = requestData;

  const { data: request, error: reqError } = await supabaseAdmin
    .from('service_requests')
    .insert([{
      tenant_id,
      item_id,
      ticket_id,
      requested_by
    }])
    .select()
    .single();

  if (reqError) throw new Error(reqError.message);

  if (responses && responses.length > 0) {
    const responseRows = responses.map((resp) => ({
      tenant_id,
      request_id: request.id,
      field_id: resp.field_id,
      value: typeof resp.value === 'object' ? JSON.stringify(resp.value) : String(resp.value)
    }));

    const { error: respError } = await supabaseAdmin
      .from('service_request_responses')
      .insert(responseRows);

    if (respError) throw new Error(respError.message);
  }

  return request;
};

module.exports = {
  getCategories,
  getItemsByCategory,
  getItemWithFormFields,
  createServiceRequest
};
