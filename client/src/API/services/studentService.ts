import api from "../axiosInstance";
import ENDPOINTS from "../endpoints";

//student API



//student API
// export const addStudentAPI = async (data: any) => {
//   console.log("Sending data to API:", data);
//   console.log("Is FormData?", data instanceof FormData);

//   try {
//     const response = await api.post(ENDPOINTS.STUDENT, data);
//     console.log("✅ API response:", response);
//     return response;
//   } catch (err: any) {
//     console.error("🔥 ERROR in Axios call:", err?.message);
//     console.error("Full Axios error:", err);
//     throw err;
//   }
// };
export const addStudentAPI = async (data: any) => {
  console.log("🚀 addStudentAPI called with:", data);
  let payload = data;

  // Check if payload has fieldsData structure (JSON format)
  if (data?.fieldsData && Array.isArray(data.fieldsData)) {
    // Check if any field contains a file
    const hasFileField = data.fieldsData.some((field: any) => 
      field.value instanceof File || field.value instanceof FileList
    );
    
    if (hasFileField) {
      console.log("🔄 Converting to FormData because files detected");
      const formData = new FormData();
      formData.append("formType", data.formType);

      data.fieldsData.forEach((field: any) => {
        if (field.value instanceof File) {
          formData.append(field.name, field.value);
        } else if (field.value instanceof FileList) {
          Array.from(field.value as FileList).forEach((file) => 
            formData.append(field.name, file)
          );
        } else {
          formData.append(field.name, field.value?.toString() || "");
        }
      });

      payload = formData;
    }
  }

  console.log("📤 Final payload:", payload);
  console.log("📦 Is FormData?", payload instanceof FormData);

  try {
    const response = await api.post(ENDPOINTS.STUDENT, payload, {
      headers: payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
    });
    console.log("✅ API response:", response);
    return response;
  } catch (err: any) {
    console.error("🔥 ERROR in Axios call:", err?.message);
    console.error("Full Axios error:", err);
    throw err;
  }
};


export const getStudentsListAPI = async (data: {
  page: Number | null;
  limit: Number | null;
  search: String | null;
  sortBy: string | null;
  order: string | null;
  status: string;
}) => {
  // console.log(data.status);

  return await api.get(ENDPOINTS.STUDENT, {
    params: {
      page: data.page,
      limit: data.limit,
      search: data.search,
      sortBy: data.sortBy,
      order: data.order,
      status: data.status,
    },
  });
};

// Get dynamic form data by formType
export const getDynamicFormDataAPI = async (formType: string) => {
  return await api.get(`${ENDPOINTS.STUDENT}/type/${formType}`);
};

// Update dynamic form data
export const updateDynamicFormDataAPI = async (id: string, data: any) => {
  return await api.put(`${ENDPOINTS.STUDENT}/${id}`, data);
};

// Delete dynamic form data
export const deleteDynamicFormDataAPI = async (id: string) => {
  return await api.delete(`${ENDPOINTS.STUDENT}/${id}`);
};
