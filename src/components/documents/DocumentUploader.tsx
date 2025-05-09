
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, X, UploadCloud, File, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  uploadDate: Date;
  filePath?: string;
}

const DocumentUploader = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing documents
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('employee_id', session.user.id);
          
        if (error) {
          throw new Error(error.message);
        }
        
        if (data) {
          const fetchedDocs = data.map(doc => ({
            id: doc.id,
            name: doc.file_name,
            size: 0, // Size info not stored in DB
            type: doc.document_type,
            lastModified: new Date(doc.uploaded_at).getTime(),
            uploadDate: new Date(doc.uploaded_at),
            filePath: doc.file_path
          }));
          
          setDocuments(fetchedDocs);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [session]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!session?.user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to upload documents."
      });
      return;
    }
    
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = Array.from(files).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload PDF, PNG, JPG, or DOCX files only.`
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds the 10MB file size limit.`
        });
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      setIsUploading(true);
      
      // Upload files to Supabase storage
      for (const file of validFiles) {
        try {
          const fileName = `${Date.now()}_${file.name}`;
          const filePath = `documents/${session.user.id}/${fileName}`;
          
          // Upload to Storage
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);
            
          if (uploadError) {
            throw new Error(`Error uploading ${file.name}: ${uploadError.message}`);
          }
          
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);
          
          // Add record to documents table
          const { data, error: dbError } = await supabase
            .from('documents')
            .insert({
              employee_id: session.user.id,
              file_path: filePath,
              file_name: file.name,
              document_type: getDocumentType(file.type),
              uploaded_by: session.user.id
            })
            .select()
            .single();
            
          if (dbError) {
            throw new Error(`Error recording ${file.name}: ${dbError.message}`);
          }
          
          // Add to state
          const newDoc = {
            id: data.id,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            uploadDate: new Date(),
            filePath
          };
          
          setDocuments(prev => [...prev, newDoc]);
          
        } catch (error: any) {
          console.error("Upload error:", error);
          toast({
            variant: "destructive",
            title: "Upload failed",
            description: error.message || "There was an error uploading your file."
          });
        }
      }
      
      setIsUploading(false);
      toast({
        title: "Documents uploaded",
        description: `Successfully uploaded ${validFiles.length} document${validFiles.length > 1 ? 's' : ''}.`
      });
    }
  };

  const getDocumentType = (mimeType: string): string => {
    if (mimeType.includes("pdf")) return "PDF";
    if (mimeType.includes("image")) return "Image";
    if (mimeType.includes("word")) return "Document";
    return "Other";
  };

  const deleteDocument = async (id: string, filePath?: string) => {
    try {
      if (!filePath) {
        throw new Error("File path not found");
      }
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);
        
      if (storageError) {
        console.error("Error deleting from storage:", storageError);
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
        
      if (dbError) {
        throw new Error(dbError.message);
      }
      
      // Update state
      setDocuments(documents.filter(doc => doc.id !== id));
      
      toast({
        title: "Document removed",
        description: "The document has been removed."
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: error.message || "There was an error removing the document."
      });
    }
  };
  
  const downloadDocument = async (documentId: string, fileName: string, filePath?: string) => {
    try {
      if (!filePath) {
        throw new Error("File path not found");
      }
      
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);
        
      if (error) {
        throw new Error(error.message);
      }
      
      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "There was an error downloading the document."
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) {
      return <FileText className="h-10 w-10 text-red-500" />;
    } else if (type.includes("image")) {
      return <FileText className="h-10 w-10 text-blue-500" />;
    } else if (type.includes("word")) {
      return <FileText className="h-10 w-10 text-brand-600" />;
    } else {
      return <FileText className="h-10 w-10 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-blue-800">Document Upload</CardTitle>
          <CardDescription>
            Upload supporting documents in PDF, PNG, JPG, or DOCX format (max 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
              isDragging 
                ? "border-blue-500 bg-blue-50" 
                : "border-muted hover:border-blue-300 hover:bg-blue-50/30"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadCloud className="h-12 w-12 text-blue-500 mb-4" />
            <p className="text-lg font-medium mb-1">
              Drag and drop files here
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              or click to browse your files
            </p>
            <input
              type="file"
              id="file-upload"
              multiple
              className="hidden"
              onChange={handleFileInput}
              accept=".pdf,.png,.jpg,.jpeg,.docx"
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isUploading}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mr-2"></div>
                  Uploading...
                </>
              ) : "Select Files"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading documents...</p>
        </div>
      ) : documents.length > 0 ? (
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-purple-800">Uploaded Documents</CardTitle>
            <CardDescription>
              {documents.length} document{documents.length > 1 ? 's' : ''} uploaded
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {documents.map(doc => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-4 border rounded-lg shadow-sm hover:shadow transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {getFileIcon(doc.type)}
                    <div className="flex-grow">
                      <p className="font-medium mb-1 line-clamp-1">{doc.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{doc.size > 0 ? formatBytes(doc.size) : "Unknown size"}</span>
                        <span>
                          Uploaded {doc.uploadDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => downloadDocument(doc.id, doc.name, doc.filePath)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteDocument(doc.id, doc.filePath)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-sm bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <File className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No Documents Yet</h3>
            <p className="text-gray-400 mt-1 mb-4">Upload documents to see them here</p>
            <Button 
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUploader;
