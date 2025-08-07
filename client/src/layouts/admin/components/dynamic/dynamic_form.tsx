import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";

import { getDynamicFormByTypeAPI } from "@/API/services/superAdminService";
import { addStudentAPI, updateDynamicFormDataAPI, getDynamicFormDataAPI } from "@/API/services/studentService";
import { getAllCourseCategoryAPI } from "@/API/services/courseService";
import { generateZodSchema } from "@/schemas/dynamicFormSchema";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { SearchSelect } from "@/layouts/components/SearchSelect";
import ImageUploader from "@/layouts/components/ImageUploader";

interface DynamicFormProps {
  formType?: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formType }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formFields, setFormFields] = useState<any[]>([]);
  const [, setCourseCategories] = useState<any[]>([]);
  
  // Check if this is edit mode
  const isEditMode = searchParams.get('isEditMode') === 'true';
  const studentId = searchParams.get('_id');

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(generateZodSchema(formFields)),
  });

  // Load form fields and pre-fill data if in edit mode
  useEffect(() => {
    if (!formType) {
      setFormFields([]);
      return;
    }

    getDynamicFormByTypeAPI(formType)
      .then(async (res: any) => {
        const fields = res?.data?.fields || [];
        
        // If this is course form, fetch course categories and update category field options
        if (formType === 'course') {
          try {
            console.log('🏷️ Fetching course categories for dynamic form...');
            const categoriesRes = await getAllCourseCategoryAPI();
            console.log('🏷️ Course categories API response:', categoriesRes.data);
            
            // The getAllCourseCategoryAPI returns {success, statusCode, message, data} format
            // where data is the array of {value: _id, label: name} objects
            const categories = categoriesRes.data?.data || [];
            setCourseCategories(categories);
            console.log('🏷️ Parsed categories:', categories);
            
            // Update the category field with dynamic options
            const updatedFields = fields.map((field: any) => {
              if (field.name === 'category' && field.type === 'select') {
                console.log('🏷️ Updating category field with options:', categories);
                return {
                  ...field,
                  options: Array.isArray(categories) ? categories.map((cat: any) => ({
                    value: cat.value, // This is the ObjectId
                    label: cat.label  // This is the category name
                  })) : []
                };
              }
              return field;
            });
            
            console.log('✅ Updated fields with categories:', updatedFields);
            setFormFields(updatedFields);
            
            // Set default value for isActive field in course forms (when not in edit mode)
            if (!isEditMode) {
              console.log('🔧 Setting default isActive to true for new course');
              setValue('isActive', true); // Set as boolean, not string
            }
          } catch (error) {
            console.error('❌ Error fetching course categories:', error);
            toast.error('Failed to load course categories');
            setFormFields(fields); // fallback to original fields
            
            // Set default value for isActive field even on error fallback
            if (!isEditMode) {
              console.log('🔧 Setting default isActive to true for new course (fallback)');
              setValue('isActive', true); // Set as boolean, not string
            }
          }
        } else if (formType === 'student') {
          // If this is student form, fetch courses from database and update selectedCourse field options
          try {
            console.log('🎓 Fetching courses for student form...');
            const coursesRes = await getDynamicFormDataAPI("course");
            console.log('🎓 Courses API response:', coursesRes.data);
            
            let courseOptions: Array<{value: string, label: string}> = [];
            
            // Check if we have dynamic courses in database
            if (coursesRes && coursesRes.data && coursesRes.data.data && Array.isArray(coursesRes.data.data) && coursesRes.data.data.length > 0) {
              console.log('✅ Found dynamic courses, using them...');
              courseOptions = coursesRes.data.data.map((courseData: any) => {
                // Extract course name from fieldsData structure
                const getFieldValue = (fieldsData: Array<{name: string; value: any}>, fieldName: string) => {
                  // Check if fieldsData has the nested structure
                  const fieldsDataField = fieldsData.find((f: any) => f.name === 'fieldsData');
                  
                  if (fieldsDataField && Array.isArray(fieldsDataField.value)) {
                    // If it's the nested structure, look in the value array
                    const field = fieldsDataField.value.find((f: any) => f.name === fieldName);
                    return field ? field.value : "";
                  } else {
                    // If it's the direct structure, look directly
                    const field = fieldsData.find((f: any) => f.name === fieldName);
                    return field ? field.value : "";
                  }
                };
                
                const courseName = getFieldValue(courseData.fieldsData, "courseName") || "Unnamed Course";
                return {
                  value: courseName,
                  label: courseName
                };
              });
              console.log('✅ Using dynamic course options:', courseOptions);
            }
            
            // Update the selectedCourse field with dynamic options
            const updatedFields = fields.map((field: any) => {
              if (field.name === 'selectedCourse' && field.type === 'select') {
                console.log('🎓 Updating selectedCourse field with options:', courseOptions);
                return {
                  ...field,
                  options: courseOptions
                };
              }
              return field;
            });
            
            console.log('✅ Updated student fields with courses:', updatedFields);
            setFormFields(updatedFields);
          } catch (error) {
            console.error('❌ Error fetching courses:', error);
            toast.error('Failed to load courses');
            setFormFields(fields); // fallback to original fields
          }
        } else {
          setFormFields(fields);
          
          // Set default value for isActive field for course forms
          if (formType === 'course' && !isEditMode) {
            console.log('🔧 Setting default isActive to true for new course (general case)');
            setValue('isActive', true); // Set as boolean, not string
          }
        }
        
        // If in edit mode, pre-fill form with URL parameter data
        if (isEditMode) {
          fields.forEach((field: any) => {
            const value = searchParams.get(field.name);
            if (value !== null && value !== '') {
              // Handle different field types
              if (field.type === 'checkbox') {
                setValue(field.name, value === 'true');
              } else if (field.type === 'number') {
                setValue(field.name, parseInt(value) || 0);
              } else {
                setValue(field.name, value);
              }
            }
          });
        }
      })
      .catch((err: any) => {
        console.error("Error fetching form fields:", err);
      });
  }, [formType, isEditMode, searchParams, setValue]);

  const onSubmit = (data: any) => {
    console.log("🔥 Form submitted with data:", data);
    
    const transformedPayload = {
      formType,
      fieldsData: Object.entries(data).map(([key, value]) => ({
        name: key,
        value: value,
      })),
    };
    
    console.log("🔥 Transformed payload:", transformedPayload);
    
    const hasFile = Object.values(data).some(
      (value) => value instanceof File || value instanceof FileList
    );

    console.log("🔥 Has file:", hasFile);

    if (isEditMode && studentId) {
      // Update mode
      if (hasFile) {
        const formData = new FormData();
        formData.append("formType", formType || "");

        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (value instanceof FileList) {
            Array.from(value).forEach((file) => formData.append(key, file));
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        console.log("🔥 Updating with FormData to API...");
        updateDynamicFormDataAPI(studentId, formData)
          .then((res: any) => {
            console.log("✅ API Response:", res);
            if (res.status === 201 || res.status === 200) {
              toast.success(`${formType} updated successfully`);
              navigate('/admin/students/registered');
            }
          })
          .catch((err: any) => {
            console.error("❌ API Error:", err);
            toast.error(err?.response?.data?.message || "Something went wrong");
          });
      } else {
        console.log("🔥 Updating with JSON payload to API...");
        updateDynamicFormDataAPI(studentId, transformedPayload)
          .then((res: any) => {
            console.log("✅ API Response:", res);
            if (res.status === 201 || res.status === 200) {
              toast.success(`${formType} updated successfully`);
              navigate('/admin/students/registered');
            }
          })
          .catch((err: any) => {
            console.error("❌ API Error:", err);
            toast.error(err?.response?.data?.message || "Something went wrong");
          });
      }
    } else {
      // Add mode (existing logic)
      if (hasFile) {
        const formData = new FormData();
        formData.append("formType", formType || "");

        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (value instanceof FileList) {
            Array.from(value).forEach((file) => formData.append(key, file));
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        console.log("🔥 Sending FormData to API...");
        addStudentAPI(formData)
          .then((res: any) => {
            console.log("✅ API Response:", res);
            if (res.status === 201 || res.status === 200) {
              reset();
              toast.success(`${formType} created successfully`);
            }
          })
          .catch((err: any) => {
            console.error("❌ API Error:", err);
            toast.error(err?.response?.data?.message || "Something went wrong");
          });
      } else {
        console.log("🔥 Sending JSON payload to API...");
        addStudentAPI(transformedPayload)
          .then((res: any) => {
            console.log("✅ API Response:", res);
            if (res.status === 201 || res.status === 200) {
              reset();
              toast.success(`${formType} created successfully`);
            }
          })
          .catch((err: any) => {
            console.error("❌ API Error:", err);
            toast.error(err?.response?.data?.message || "Something went wrong");
          });
      }
    }
  };

  const renderField = (field: any) => {
    const errorForField = errors?.[field.name];
    const commonProps = {
      id: field.name,
      placeholder: field.placeholder || "",
      className: errorForField ? "border-red-500 focus:ring-red-500" : "",
      ...register(field.name),
    };

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input type={field.type} {...commonProps} />
            {errorForField && (
              <p className="text-red-500 text-sm">{errorForField.message as string}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Textarea {...commonProps} />
            {errorForField && (
              <p className="text-red-500 text-sm">{errorForField.message as string}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input 
              type="date" 
              {...commonProps}
            />
            {errorForField && (
              <p className="text-red-500 text-sm">{errorForField.message as string}</p>
            )}
          </div>
        );

      case "select":
        console.log('🏷️ Rendering select field:', field.name, 'options:', field.options);
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <SearchSelect
                  width="100%"
                  data={field.options?.map((opt: any) => ({
                    label: opt.label || opt.value,
                    value: opt.value || opt.label,
                  })) || []}
                  title={field.label}
                  notFound="Not Found"
                  value={controllerField.value}
                  setValue={controllerField.onChange}
                  placeholder={field.placeholder || `Select ${field.label}`}
                  className={errorForField ? "border-red-500 focus:ring-red-500" : ""}
                />
              )}
            />
            {errorForField && (
              <p className="text-red-500 text-sm">{errorForField.message as string}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Controller
              control={control}
              name={field.name}
              render={({ field: controllerField }) => (
                <Checkbox
                  id={field.name}
                  checked={controllerField.value === true || controllerField.value === 'true'}
                  onCheckedChange={(checked) => controllerField.onChange(checked ? 'true' : 'false')}
                />
              )}
            />
            <label htmlFor={field.name} className="text-sm">
              {field.label}
            </label>
          </div>
        );

      case "file":
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <ImageUploader
                  value={controllerField.value}
                  onChange={controllerField.onChange}
                  error={errorForField?.message as string}
                />
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!formType || !formFields.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8 py-10 bg-gray-50">
        <Card className="w-full max-w-2xl p-8 rounded-2xl shadow-lg bg-white text-center">
          <h2 className="font-bold text-xl mb-4">No format for this section</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex items-start justify-center">
      <Card className="dynamic-form-card card-container w-full max-w-4xl p-6 md:p-8 rounded-2xl shadow-lg bg-white mx-auto">
        <CardHeader className="font-bold">
          <div className="w-full flex justify-between items-center">
            <h2 className="text-xl md:text-2xl">
              {isEditMode ? 'Edit' : 'Add'} {formType.charAt(0).toUpperCase() + formType.slice(1)}
            </h2>
          </div>
        </CardHeader>
        <Separator />
        <form onSubmit={handleSubmit((data) => {
          console.log("📝 Form validation passed, calling onSubmit...");
          onSubmit(data);
        }, (errors) => {
          console.error("❌ Form validation failed:", errors);
          toast.error("Please fill all required fields correctly");
        })} className="flex flex-col gap-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {formFields
              .filter((field) => field.type !== "checkbox" && field.type !== "file")
              .map((field) => (
                <div key={field.name} className="flex flex-col gap-2">
                  {field.name === "phoneNumber"
                    ? (() => {
                        const errorForField = errors?.[field.name];
                        return (
                          <>
                            <Label htmlFor="phoneNumber">{field.label || "Phone Number"}</Label>
                            <Input
                              type="tel"
                              id="phoneNumber"
                              placeholder={field.placeholder || "Enter phone number"}
                              {...register(field.name)}
                              className={errorForField ? "border-red-500 focus:ring-red-500" : ""}
                            />
                            {errorForField && (
                              <p className="text-red-500 text-sm">{errorForField.message as string}</p>
                            )}
                          </>
                        );
                      })()
                    : renderField(field)}
                </div>
              ))}
          </div>

          <div className="flex flex-row gap-6 flex-wrap mt-2">
            {formFields
              .filter((field) => field.type === "checkbox")
              .map((field) => (
                <div key={field.name}>{renderField(field)}</div>
              ))}
          </div>

          <div className="flex flex-row gap-6 flex-wrap mt-2 w-full">
            {formFields
              .filter((field) => field.type === "file")
              .map((field) => (
                <div key={field.name}>{renderField(field)}</div>
              ))}
          </div>

          <Separator className="my-4" />
          <CardFooter className="flex justify-end gap-4 px-0">
            <Button type="reset" variant="outline" onClick={() => {
              console.log("🔄 Reset button clicked");
              reset();
            }}>
              Refresh
            </Button>
            <Button 
              type="submit" 
              onClick={() => console.log("🔘 Submit button clicked")}
            >
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default DynamicForm;
