# Blog Form Component Documentation

## 📋 Overview

The `BlogFormComponent` is a unified component that handles both **creating new blog posts** and **editing existing blog posts**. It automatically detects the mode based on the URL parameters and adjusts its behavior accordingly.

## 🎯 Features

### **Create Mode**
- ✅ Create new blog posts from scratch
- ✅ Rich text editor with image upload
- ✅ Category and subcategory selection
- ✅ Draft saving functionality
- ✅ Featured image upload

### **Edit Mode**
- ✅ Load existing blog data
- ✅ Pre-populate form fields
- ✅ Update existing blog posts
- ✅ Preserve existing featured images
- ✅ Change or remove featured images

## 🚀 Usage

### **1. Create New Blog Post**
```html
<!-- Route: /create-blog or /blogs/create -->
<app-blog-form></app-blog-form>
```

### **2. Edit Existing Blog Post**
```html
<!-- Route: /edit-blog/:id or /blogs/edit/:id -->
<app-blog-form></app-blog-form>
```

## 🔧 Route Configuration

### **Option 1: Separate Routes**
```typescript
const routes: Routes = [
  { path: 'create-blog', component: BlogFormComponent },
  { path: 'edit-blog/:id', component: BlogFormComponent },
  // or
  { path: 'blogs/create', component: BlogFormComponent },
  { path: 'blogs/edit/:id', component: BlogFormComponent }
];
```

### **Option 2: Single Route with Optional Parameter**
```typescript
const routes: Routes = [
  { path: 'blog-form/:id?', component: BlogFormComponent }
];
```

## 📊 Component Properties

### **Mode Detection**
```typescript
isEditMode: boolean = false;        // True when editing existing blog
blogId: number | null = null;       // Blog ID from URL params
existingBlog: Blog | null = null;   // Loaded blog data
existingFeaturedImage: string | null = null; // Current featured image
```

### **Form Structure**
```typescript
blogForm: FormGroup = {
  title: ['', [Validators.required, Validators.minLength(5)]],
  excerpt: ['', [Validators.required, Validators.minLength(10)]],
  content: ['', [Validators.required, Validators.minLength(50)]],
  category_id: ['', Validators.required],
  subcategory_id: [''],
  author: ['Admin', Validators.required],
  tags: [''],
  is_published: [false],
  is_featured: [false]
}
```

## 🔄 Workflow

### **Create Mode Workflow**
1. **Initialize** - Component starts in create mode
2. **Load Data** - Categories and subcategories loaded
3. **User Input** - User fills form and uploads images
4. **Validation** - Form validation before submission
5. **Submit** - Creates new blog via API
6. **Redirect** - Navigate to blogs list

### **Edit Mode Workflow**
1. **Route Detection** - Component detects blog ID from URL
2. **Load Blog** - Fetches existing blog data from API
3. **Populate Form** - Pre-fills form with existing data
4. **User Modifications** - User can modify any field
5. **Validation** - Form validation before submission
6. **Update** - Updates existing blog via API
7. **Redirect** - Navigate to blogs list

## 🎨 UI Differences

### **Create Mode**
- Header: "Create New Blog Post"
- Featured image upload section visible
- Button text: "Create Blog"
- Icon: "publish"

### **Edit Mode**
- Header: "Edit Blog Post"
- Existing featured image display
- Button text: "Update Blog"
- Icon: "update"

## 🔧 API Integration

### **Required API Methods**
```typescript
// Get single blog for editing
getBlog(id: number): Observable<ApiResponse<Blog>>

// Create new blog
createBlog(data: CreateBlogRequest): Observable<ApiResponse<Blog>>

// Update existing blog
updateBlog(id: number, data: Partial<Blog>): Observable<ApiResponse<Blog>>

// Upload images
uploadImage(file: File, type: string): Observable<ApiResponse<any>>
```

## 📝 Form Validation

### **Required Fields**
- **Title** - Minimum 5 characters
- **Excerpt** - Minimum 10 characters
- **Content** - Minimum 50 characters
- **Category** - Must be selected
- **Author** - Required

### **Optional Fields**
- **Subcategory** - Optional selection
- **Tags** - Comma-separated list
- **Featured Image** - Optional upload
- **Publishing Options** - Draft/Published, Featured

## 🖼️ Image Handling

### **Create Mode**
- New featured image upload
- Inline image insertion in editor
- File validation (type, size)

### **Edit Mode**
- Display existing featured image
- Option to change or remove image
- Preserve existing image if no new upload

## 🚨 Error Handling

### **Load Errors**
- Blog not found → Redirect to blogs list
- API errors → Show error message
- Network issues → Retry mechanism

### **Validation Errors**
- Form validation → Mark fields as touched
- File validation → Show specific error messages
- API validation → Display server error messages

## 📱 Responsive Design

### **Mobile Optimizations**
- Stacked form layout
- Touch-friendly buttons
- Reduced editor height
- Optimized image previews

### **Desktop Features**
- Side-by-side form fields
- Full editor height
- Hover effects
- Keyboard shortcuts

## 🔒 Security Features

### **Input Validation**
- Client-side form validation
- Server-side validation
- File type and size restrictions
- XSS prevention

### **Data Protection**
- CSRF protection
- Input sanitization
- Secure file uploads
- Authentication checks

## 🧪 Testing Considerations

### **Unit Tests**
- Mode detection logic
- Form validation
- Image upload handling
- API integration

### **Integration Tests**
- Create workflow
- Edit workflow
- Error scenarios
- Navigation flows

## 📋 Best Practices

### **Performance**
- Lazy load categories/subcategories
- Debounce form validation
- Optimize image uploads
- Cache API responses

### **User Experience**
- Clear loading states
- Helpful error messages
- Auto-save functionality
- Keyboard navigation

### **Code Organization**
- Separate concerns (create/edit)
- Reusable components
- Type safety
- Error boundaries

## 🚀 Quick Start

### **1. Add to Routes**
```typescript
{ path: 'blog-form/:id?', component: BlogFormComponent }
```

### **2. Navigate to Create**
```typescript
this.router.navigate(['/blog-form']);
```

### **3. Navigate to Edit**
```typescript
this.router.navigate(['/blog-form', blogId]);
```

### **4. Handle Results**
```typescript
// Component automatically handles success/error
// Redirects to blogs list on completion
```

---

**Last Updated:** January 27, 2025  
**Version:** 2.0.0  
**Component:** BlogFormComponent
