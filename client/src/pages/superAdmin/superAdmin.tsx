import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { 
  setStudentFields, 
  setCourseFields, 
  setBranchFields, 
  setLoading, 
  setError 
} from "@/reducer/superAdmin"
import { 
  createDynamicFormAPI, 
  getDynamicFormByTypeAPI,
  updateDynamicFormAPI,
  convertFieldsFromBackend,
  type DynamicFormData 
} from "@/API/services/superAdminService"
import { getAllCourseCategoryAPI, getAllCourseAPI } from "@/API/services/courseService"
import { getDynamicFormDataAPI } from "@/API/services/studentService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast, Toaster } from "sonner"
import { Save, RotateCcw, User, GraduationCap, MapPin, Calendar, UserCheck, Building, BookOpen, Plus, Edit3 } from "lucide-react"
// Import extracted components
import { 
  Sidebar, 
  FormHeader, 
  FormOrderPreview, 
  FieldConfigCard, 
  AddFieldForm 
} from './components'

// Import types
import type { FieldConfig, CustomForm, NewFieldForm, FormType } from './types'
import { categoryLabels } from './types'

// Import default field configurations
import { defaultStudentFields, defaultCourseFields, defaultBranchFields } from './constants'

// Icon mapping function
const getIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'User': <User className="h-4 w-4" />,
    'GraduationCap': <GraduationCap className="h-4 w-4" />,
    'MapPin': <MapPin className="h-4 w-4" />,
    'Calendar': <Calendar className="h-4 w-4" />,
    'UserCheck': <UserCheck className="h-4 w-4" />,
    'Building': <Building className="h-4 w-4" />,
    'BookOpen': <BookOpen className="h-4 w-4" />,
  }
  return iconMap[iconName] || <User className="h-4 w-4" />
}

// Custom hook for media query
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addListener(listener)
    return () => media.removeListener(listener)
  }, [matches, query])

  return matches
}

const SuperAdminPanel = () => {
  console.log('🏁 SuperAdminPanel component initialized!')
  
  const dispatch = useDispatch<AppDispatch>()
  const { studentFields, courseFields, branchFields, loading, error } = useSelector(
    (state: RootState) => state.superAdmin
  )
  
  console.log('📊 Redux state:', { studentFields: studentFields.length, courseFields: courseFields.length, branchFields: branchFields.length, loading, error })
  
  const [activeForm, setActiveForm] = useState<FormType>('student')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Dynamic form creation states
  const [showAddForm, setShowAddForm] = useState(false)
  const [newFormName, setNewFormName] = useState('')
  const [customForms, setCustomForms] = useState<CustomForm[]>(() => {
    // Load custom forms from localStorage on initialization
    const savedForms = localStorage.getItem('customForms')
    return savedForms ? JSON.parse(savedForms) : []
  })
  const [isCreatingCustomForm, setIsCreatingCustomForm] = useState(false)
  const [showAddField, setShowAddField] = useState(false)
  const [newField, setNewField] = useState<NewFieldForm>({
    name: '',
    label: '',
    description: '',
    category: 'basic',
    iconName: 'User',
    inputType: 'text',
    options: '',
    searchable: false
  })

  // Use media query for responsive design
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  
  // Ref to prevent multiple simultaneous category loading
  const loadingCategoriesRef = React.useRef(false)

  // Save custom forms to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customForms', JSON.stringify(customForms))
  }, [customForms])

  // Load course categories dynamically and update course fields
  const loadCourseCategories = async () => {
    // Prevent multiple simultaneous requests
    if (loadingCategoriesRef.current) {
      console.log('🚫 Categories already loading, skipping...')
      return
    }
    
    try {
      loadingCategoriesRef.current = true
      console.log('🏷️ Loading course categories dynamically...')
      const response = await getAllCourseCategoryAPI()
      console.log('🏷️ Category API response:', response.data)
      
      // Fix: ApiResponse wraps data in response.data property
      if (response.data) {
        const categories = response.data.map((cat: any) => cat.label || cat.name)
        
        console.log('✅ Fetched categories:', categories)
        
        // Update course fields
        const currentCourseFields = courseFields.length > 0 ? courseFields : defaultCourseFields
        
        // Check if categories have actually changed to prevent unnecessary updates
        const currentCategoryField = currentCourseFields.find(field => field.name === 'category')
        const currentOptions = currentCategoryField?.options || []
        
        const categoriesChanged = JSON.stringify([...currentOptions].sort()) !== JSON.stringify([...categories].sort())
        
        if (categoriesChanged) {
          console.log('📝 Course categories changed, updating course fields...')
          // Update the course fields with dynamic categories
          const updatedCourseFields = currentCourseFields.map(field => {
            if (field.name === 'category') {
              return {
                ...field,
                options: categories
              }
            }
            return field
          })
          
          dispatch(setCourseFields(updatedCourseFields))
        }

        // Update student fields - selectedCourse field
        const currentStudentFields = studentFields.length > 0 ? studentFields : defaultStudentFields
        
        // Check if student course options have changed
        const currentCourseField = currentStudentFields.find(field => field.name === 'selectedCourse')
        const currentCourseOptions = currentCourseField?.options || []
        
        const studentCourseOptionsChanged = JSON.stringify([...currentCourseOptions].sort()) !== JSON.stringify([...categories].sort())
        
        if (studentCourseOptionsChanged) {
          console.log('📝 Student course categories changed, updating student fields...')
          // Update the student fields with dynamic categories
          const updatedStudentFields = currentStudentFields.map(field => {
            if (field.name === 'selectedCourse') {
              return {
                ...field,
                options: categories
              }
            }
            return field
          })
          
          dispatch(setStudentFields(updatedStudentFields))
        }

        if (!categoriesChanged && !studentCourseOptionsChanged) {
          console.log('✅ Categories unchanged, skipping update')
        }
      } else {
        console.warn('⚠️ Invalid course categories response format')
        console.warn('⚠️ Expected array, got:', typeof response.data, response.data)
      }
    } catch (error) {
      console.error('❌ Error loading course categories:', error)
      toast.error('Failed to load course categories')
    } finally {
      loadingCategoriesRef.current = false
    }
  }

  // Load courses for student selection and generate registration years  
  const loadCoursesAndYears = async () => {
    try {
      console.log('📚 Loading courses for student selection...')
      
      // Try to get courses from dynamic form data (courses created via Course Management)
      const coursesResponse = await getDynamicFormDataAPI("course")
      console.log('📚 Dynamic courses API response:', coursesResponse)
      
      let courseOptions: string[] = []
      
      // Check if we have dynamic courses in database
      if (coursesResponse && coursesResponse.data && coursesResponse.data.data && Array.isArray(coursesResponse.data.data) && coursesResponse.data.data.length > 0) {
        console.log('✅ Found dynamic courses, using them...')
        courseOptions = coursesResponse.data.data.map((courseData: any, index: number) => {
          console.log(`📚 Processing course ${index + 1}:`, courseData)
          
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
          
          const courseName = getFieldValue(courseData.fieldsData, "courseName") || `Course ${index + 1}`
          return courseName
        })
        console.log('✅ Using dynamic course options:', courseOptions)
      } else {
        console.log('⚠️ No dynamic courses found, trying traditional Course API...')
        
        // Fallback: Try traditional Course API
        try {
          const traditionalCoursesResponse = await getAllCourseAPI()
          console.log('📚 Traditional courses API response:', traditionalCoursesResponse)
          
          if (traditionalCoursesResponse && traditionalCoursesResponse.data && Array.isArray(traditionalCoursesResponse.data) && traditionalCoursesResponse.data.length > 0) {
            courseOptions = traditionalCoursesResponse.data.map((course: any) => {
              return course.label || course.name || course.courseName
            })
            console.log('✅ Using traditional course options:', courseOptions)
          }
        } catch (traditionalError) {
          console.error('❌ Error loading traditional courses:', traditionalError)
        }
        
        // If still no courses, fallback to course categories
        if (courseOptions.length === 0) {
          console.log('⚠️ No traditional courses found, falling back to course categories...')
          try {
            const categoriesResponse = await getAllCourseCategoryAPI()
            console.log('📚 Categories fallback response:', categoriesResponse)
            
            if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
              courseOptions = categoriesResponse.data.map((cat: any) => cat.label || cat.name)
              console.log('✅ Using course categories as fallback:', courseOptions)
            }
          } catch (catError) {
            console.error('❌ Error loading course categories as fallback:', catError)
            // Final fallback to static options
            courseOptions = ['Computer Science', 'Business Administration', 'Management']
            console.log('✅ Using static fallback options:', courseOptions)
          }
        }
      }
      
      // Generate registration years (current year and previous 10 years)
      const currentYear = new Date().getFullYear()
      const registrationYears: string[] = []
      for (let i = 0; i <= 10; i++) {
        registrationYears.push((currentYear - i).toString())
      }
      console.log('📅 Generated registration years:', registrationYears)
      
      // Update student fields with dynamic course categories and years
      const currentStudentFields = studentFields.length > 0 ? studentFields : defaultStudentFields
      
      const updatedStudentFields = currentStudentFields.map(field => {
        if (field.name === 'selectedCourse') {
          console.log('🔄 Updating selectedCourse field with options:', courseOptions)
          return {
            ...field,
            options: courseOptions
          }
        }
        if (field.name === 'registrationYear') {
          return {
            ...field,
            options: registrationYears
          }
        }
        return field
      })
      
      console.log('🧩 Final updated student fields:', updatedStudentFields.find(f => f.name === 'selectedCourse'))
      dispatch(setStudentFields(updatedStudentFields))
      console.log('✅ Updated student fields with dynamic courses and years')
      
    } catch (error) {
      console.error('❌ Error loading courses and years:', error)
      toast.error('Failed to load courses and registration years')
    }
  }

  // Load existing form configurations on component mount
  useEffect(() => {
    console.log('🔥 useEffect triggered - loadFormConfigurations starting...')
    console.log('🌐 Environment check:', {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE
    })
    
    const loadFormConfigurations = async () => {
      console.log('📡 Starting loadFormConfigurations function...')
      dispatch(setLoading(true))
      try {
        const loadFormData = async (formType: string) => {
          try {
            console.log(`🔄 Making API request for formType: ${formType}`)
            console.log(`🌐 API URL: ${import.meta.env.VITE_API_BASE_URL}/dynamic-forms/type/${formType}`)
            const response = await getDynamicFormByTypeAPI(formType)
            console.log(`✅ API Response for ${formType}:`, response)
            return response.success ? response : null
          } catch (error) {
            console.error(`❌ API Error for ${formType}:`, error)
            return null
          }
        }

        console.log('🚀 About to call Promise.all with API requests...')
        const [studentData, courseData, branchData] = await Promise.all([
          loadFormData('student'),
          loadFormData('course'),
          loadFormData('branch')
        ])
        console.log('📋 Promise.all completed:', { studentData, courseData, branchData })

        // If API data exists, use it; otherwise, use default local data
        if (studentData?.data) {
          dispatch(setStudentFields(convertFieldsFromBackend(studentData.data.fields)))
        } else {
          dispatch(setStudentFields(defaultStudentFields))
        }
        
        if (courseData?.data) {
          dispatch(setCourseFields(convertFieldsFromBackend(courseData.data.fields)))
        } else {
          dispatch(setCourseFields(defaultCourseFields))
        }
        
        if (branchData?.data) {
          dispatch(setBranchFields(convertFieldsFromBackend(branchData.data.fields)))
        } else {
          dispatch(setBranchFields(defaultBranchFields))
        }

        // Load any custom forms that might exist in backend
        console.log('📋 Loading custom forms...')
        const savedCustomForms = localStorage.getItem('customForms')
        if (savedCustomForms) {
          const customFormsFromStorage = JSON.parse(savedCustomForms)
          // Try to load each custom form from backend
          for (const customForm of customFormsFromStorage) {
            try {
              const customFormData = await loadFormData(customForm.id)
              if (customFormData?.data) {
                // Update the custom form with backend data
                customForm.fields = convertFieldsFromBackend(customFormData.data.fields)
                console.log(`✅ Loaded custom form ${customForm.id} from backend`)
              }
            } catch (error) {
              console.log(`ℹ️ Custom form ${customForm.id} not found in backend, using local data`)
            }
          }
          setCustomForms(customFormsFromStorage)
        }

        // Categories will be loaded when activeForm changes to course via the other useEffect
        
      } catch (error) {
        console.error('Error loading form configurations:', error)
        // Load default data if API fails
        dispatch(setStudentFields(defaultStudentFields))
        dispatch(setCourseFields(defaultCourseFields))
        dispatch(setBranchFields(defaultBranchFields))
        dispatch(setError('Failed to load saved configurations. Using defaults.'))
      } finally {
        dispatch(setLoading(false))
        console.log('🏁 loadFormConfigurations completed!')
      }
    }

    console.log('⚡ About to call loadFormConfigurations...')
    loadFormConfigurations()
      .then(() => console.log('✅ loadFormConfigurations resolved successfully'))
      .catch(err => console.error('❌ loadFormConfigurations rejected:', err))
  }, [dispatch])

  // Reload course categories when switching to course or student form
  useEffect(() => {
    if (activeForm === 'course' || activeForm === 'student') {
      console.log(`🔄 Active form changed to ${activeForm}, reloading categories...`)
      loadCourseCategories()
      
      // Load courses and years for student form
      if (activeForm === 'student') {
        loadCoursesAndYears()
      }
    }
  }, [activeForm]) // Removed courseFields from dependency array to prevent infinite loop

  // Convert frontend data to backend format
  const convertFrontendToBackend = (fields: FieldConfig[], formType: FormType | string): DynamicFormData => {
    const fieldsArray = fields.map(field => ({
      name: field.name,
      label: field.label,
      placeholder: field.description,
      type: field.inputType as 'text' | 'number' | 'email' | 'date' | 'tel' | 'file' | 'select' | 'textarea' | 'checkbox' | 'radio',
      isActive: field.enabled,
      order: field.position,
      options: field.options ? field.options.map(opt => ({ value: opt })) : [],
      isSearchable: field.searchable || false
    }))

    return {
      formType: formType as any, // Allow custom form types
      fields: fieldsArray
    }
  }

  // Use Redux fields or fallback to default
  const getCurrentFields = () => {
    // Check if activeForm is a custom form
    const customForm = customForms.find(form => form.id === activeForm)
    if (customForm) {
      return customForm.fields
    }

    switch (activeForm) {
      case 'student': 
        return studentFields.length > 0 ? studentFields : defaultStudentFields
      case 'course': 
        return courseFields.length > 0 ? courseFields : defaultCourseFields
      case 'branch': 
        return branchFields.length > 0 ? branchFields : defaultBranchFields
      default: 
        return studentFields.length > 0 ? studentFields : defaultStudentFields
    }
  }

  // Update Redux fields
  const setCurrentFields = (fields: FieldConfig[]) => {
    // Check if activeForm is a custom form
    const customFormIndex = customForms.findIndex(form => form.id === activeForm)
    if (customFormIndex !== -1) {
      const updatedForms = [...customForms]
      updatedForms[customFormIndex].fields = fields
      setCustomForms(updatedForms)
      return
    }

    switch (activeForm) {
      case 'student': 
        dispatch(setStudentFields(fields))
        break
      case 'course': 
        dispatch(setCourseFields(fields))
        break
      case 'branch': 
        dispatch(setBranchFields(fields))
        break
    }
  }

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    e.dataTransfer.setData('text/plain', fieldId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault()
    const draggedFieldId = e.dataTransfer.getData('text/plain')
    
    if (draggedFieldId === targetFieldId) return

    const currentFields = [...getCurrentFields()].sort((a, b) => a.position - b.position)
    const draggedIndex = currentFields.findIndex(field => field.id === draggedFieldId)
    const targetIndex = currentFields.findIndex(field => field.id === targetFieldId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newFields = [...currentFields]
    const [draggedField] = newFields.splice(draggedIndex, 1)
    newFields.splice(targetIndex, 0, draggedField)

    // Reassign positions based on new order
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      position: index + 1
    }))

    setCurrentFields(updatedFields)
    toast.success(`Moved "${draggedField.label}" to new position`, {
      duration: 2000,
      position: 'top-right'
    })
  }

  const toggleField = (fieldId: string) => {
    const currentFields = getCurrentFields()
    const updatedFields = currentFields.map(field => 
      field.id === fieldId 
        ? { ...field, enabled: !field.enabled }
        : field
    )
    setCurrentFields(updatedFields)
  }

  const saveConfiguration = async () => {
    console.log('💾 Starting saveConfiguration process...')
    console.log('🌐 API Base URL:', import.meta.env.VITE_API_BASE_URL)
    dispatch(setLoading(true))
    
    // Show loading toast
    toast.loading('Saving configuration...', { id: 'save-config' })
    
    try {
      const currentFields = getCurrentFields()
      const enabledFields = currentFields.filter(field => field.enabled)
      
      console.log('📋 Current fields:', currentFields.length)
      console.log('✅ Enabled fields:', enabledFields.length)
      console.log('📝 Active form type:', activeForm)
      
      // Convert frontend data to backend format
      const formData = convertFrontendToBackend(currentFields, activeForm)
      console.log('🔄 Converted form data:', JSON.stringify(formData, null, 2))
      
      // First, try to check if configuration already exists
      console.log('🔍 Checking if configuration already exists...')
      let existingConfig = null
      try {
        console.log(`🌐 Making GET request to: ${import.meta.env.VITE_API_BASE_URL}/dynamic-forms/type/${activeForm}`)
        const existingResponse = await getDynamicFormByTypeAPI(activeForm)
        if (existingResponse.success && existingResponse.data) {
          existingConfig = existingResponse.data
          console.log('📋 Found existing configuration:', existingConfig)
        }
      } catch (error) {
        console.log('ℹ️ No existing configuration found, will create new one')
        console.error('🔍 Error checking existing config:', error)
      }
      
      let response
      if (existingConfig && existingConfig._id) {
        // UPDATE existing configuration
        console.log('🔄 Updating existing configuration with ID:', existingConfig._id)
        console.log(`🌐 Making PUT request to: ${import.meta.env.VITE_API_BASE_URL}/dynamic-forms/${existingConfig._id}`)
        response = await updateDynamicFormAPI(existingConfig._id, formData)
        console.log('✅ Update response:', response)
      } else {
        // CREATE new configuration
        console.log('➕ Creating new configuration...')
        console.log(`🌐 Making POST request to: ${import.meta.env.VITE_API_BASE_URL}/dynamic-forms`)
        response = await createDynamicFormAPI(formData)
        console.log('✅ Create response:', response)
      }
      
      // Dismiss loading toast
      toast.dismiss('save-config')
      
      if (response.success) {
        const action = existingConfig ? 'updated' : 'created'
        toast.success(`${activeForm.charAt(0).toUpperCase() + activeForm.slice(1)} form configuration ${action} successfully! ${enabledFields.length} fields enabled.`, {
          duration: 4000,
          position: 'top-right'
        })
        console.log(`✅ Successfully ${action} ${activeForm} configuration`)
      } else {
        throw new Error(response.message || 'Failed to save configuration')
      }
    } catch (error: any) {
      console.error('❌ Error saving configuration:', error)
      // Dismiss loading toast
      toast.dismiss('save-config')
      toast.error(error.message || 'Failed to save configuration. Please try again.', {
        duration: 5000,
        position: 'top-right'
      })
      dispatch(setError('Failed to save configuration'))
    } finally {
      dispatch(setLoading(false))
      console.log('🏁 saveConfiguration process completed')
    }
  }

  const resetToDefault = () => {
    const currentFields = getCurrentFields()
    const defaultEnabledFields = ['name', 'email', 'contactNumber', 'address', 'isActive']
    const updatedFields = currentFields.map((field, index) => ({
      ...field,
      enabled: defaultEnabledFields.includes(field.name) || field.name.includes('Name') || field.name.includes('Code'),
      position: index + 1 // Reset positions to original order
    }))
    setCurrentFields(updatedFields)
    toast.success(`${activeForm.charAt(0).toUpperCase() + activeForm.slice(1)} form configuration reset to default settings.`, {
      duration: 3000,
      position: 'top-right'
    })
  }

  // Custom form creation functions
  const createNewForm = () => {
    if (!newFormName.trim()) {
      toast.error('Please enter a form name', {
        duration: 3000,
        position: 'top-right'
      })
      return
    }

    const formId = newFormName.toLowerCase().replace(/\s+/g, '-')
    const newForm: CustomForm = {
      id: formId,
      name: formId,
      label: newFormName,
      description: `Configure ${newFormName.toLowerCase()} fields`,
      fields: []
    }

    setCustomForms(prev => [...prev, newForm])
    setActiveForm(formId as FormType)
    setIsCreatingCustomForm(true)
    setNewFormName('')
    setShowAddForm(false)
    toast.success(`Created new form: ${newFormName}`, {
      duration: 4000,
      position: 'top-right'
    })
  }

  const addFieldToForm = () => {
    if (!newField.name.trim() || !newField.label.trim()) {
      toast.error('Please fill in field name and label', {
        duration: 3000,
        position: 'top-right'
      })
      return
    }

    const currentFields = getCurrentFields()
    const fieldId = `${activeForm}_${newField.name}_${Date.now()}`
    const options = newField.inputType === 'select' && newField.options.trim() 
      ? newField.options.split(',').map(opt => opt.trim()).filter(opt => opt)
      : undefined

    const newFieldConfig: FieldConfig = {
      id: fieldId,
      name: newField.name,
      label: newField.label,
      description: newField.description,
      enabled: true,
      position: currentFields.length + 1,
      category: newField.category,
      iconName: newField.iconName,
      inputType: newField.inputType,
      options,
      searchable: newField.inputType === 'select' ? newField.searchable : undefined
    }

    const updatedFields = [...currentFields, newFieldConfig]
    setCurrentFields(updatedFields)

    // Reset form
    setNewField({
      name: '',
      label: '',
      description: '',
      category: 'basic',
      iconName: 'User',
      inputType: 'text',
      options: '',
      searchable: false
    })
    setShowAddField(false)
    toast.success(`Added field: ${newField.label}`, {
      duration: 3000,
      position: 'top-right'
    })
  }

  // Show loading spinner when initially loading data
  if (loading && studentFields.length === 0 && courseFields.length === 0 && branchFields.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading form configurations...</p>
        </div>
      </div>
    )
  }

  const formOptions = [
    { 
      key: 'student' as FormType, 
      label: 'Student Form', 
      icon: <GraduationCap className="h-5 w-5" />,
      description: 'Configure student registration fields'
    },
    { 
      key: 'course' as FormType, 
      label: 'Course Form', 
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Configure course creation fields'
    },
    { 
      key: 'branch' as FormType, 
      label: 'Branch Form', 
      icon: <Building className="h-5 w-5" />,
      description: 'Configure branch setup fields'
    },
    // Add custom forms
    ...customForms.map(form => ({
      key: form.id as FormType,
      label: form.label,
      icon: <Edit3 className="h-5 w-5" />,
      description: form.description
    }))
  ]

  // Get current fields for the active form
  const currentFields = [...getCurrentFields()].sort((a, b) => a.position - b.position)
  const enabledCount = currentFields.filter(field => field.enabled).length
  
  // Group fields by category for display
  const groupedFields = currentFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = []
    }
    acc[field.category].push(field)
    return acc
  }, {} as Record<string, FieldConfig[]>)

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex relative overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isDesktop={isDesktop}
        activeForm={activeForm}
        setActiveForm={setActiveForm}
        customForms={customForms}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        newFormName={newFormName}
        setNewFormName={setNewFormName}
        createNewForm={createNewForm}
        enabledCount={enabledCount}
        totalFields={currentFields.length}
        resetToDefault={resetToDefault}
        saveConfiguration={saveConfiguration}
        loading={loading}
      />

      {/* Main Content */}
      <div className={`flex-1 p-6 transition-all duration-300 overflow-y-auto h-screen ${isDesktop ? '' : 'w-full'}`}>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <FormHeader
            activeForm={activeForm}
            formOptions={formOptions}
            enabledCount={enabledCount}
            totalFields={currentFields.length}
            error={error}
          />

          {/* Form Order Preview */}
          <FormOrderPreview currentFields={currentFields} />

          {/* Field Configuration Cards */}
          <div className="grid gap-6">
            {Object.entries(groupedFields).map(([category, fields]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </CardTitle>
                  <Separator />
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {fields.map((field) => {
                      // Get the global position among all fields
                      const globalIndex = currentFields.findIndex(f => f.id === field.id)
                      
                      return (
                        <FieldConfigCard
                          key={field.id}
                          field={field}
                          globalIndex={globalIndex}
                          onToggle={toggleField}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onDelete={(fieldId) => {
                            const customFormIndex = customForms.findIndex(form => form.id === activeForm)
                            if (customFormIndex !== -1) {
                              const updatedForms = [...customForms]
                              updatedForms[customFormIndex].fields = updatedForms[customFormIndex].fields.filter(f => f.id !== fieldId)
                              setCustomForms(updatedForms)
                              toast.success(`Deleted field: ${field.label}`)
                            }
                          }}
                          showDeleteButton={isCreatingCustomForm}
                          getIcon={getIcon}
                        />
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Field Button */}
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => {
                console.log('Add Field button clicked!')
                setShowAddField(true)
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-3" />
              Add New Field to {formOptions.find(option => option.key === activeForm)?.label}
            </Button>
          </div>

          {/* Add Field Form */}
          <AddFieldForm
            isVisible={showAddField}
            onClose={() => setShowAddField(false)}
            newField={newField}
            setNewField={setNewField}
            onAddField={addFieldToForm}
            formName={formOptions.find(option => option.key === activeForm)?.label || ''}
          />

          {/* Footer Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Changes will be applied to all future {activeForm} operations.</p>
                  <p className="mt-1">Current configuration: <span className="font-semibold">{enabledCount} fields enabled</span></p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetToDefault}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All
                  </Button>
                  <Button 
                    onClick={saveConfiguration} 
                    disabled={loading}
                    className="min-w-[120px]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    <Toaster position="top-right" />
    </>
  )
}

export default SuperAdminPanel
