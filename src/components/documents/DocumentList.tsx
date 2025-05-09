
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  document_type: string;
  uploaded_at: string;
}

const DocumentList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();
  
  // Fetch documents from Supabase
  useEffect(() => {
    if (!session?.user) return;
    
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (session.user.id === "demo-user-id") {
          // Provide mock data for demo
          const mockDocs = [
            {
              id: "doc-1",
              file_name: "timesheet-2025-05.pdf",
              file_path: "documents/timesheets/timesheet-2025-05.pdf",
              document_type: "timesheet",
              uploaded_at: new Date().toISOString()
            },
            {
              id: "doc-2",
              file_name: "id-card.jpg",
              file_path: "documents/id/id-card.jpg",
              document_type: "id",
              uploaded_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
            },
            {
              id: "doc-3",
              file_name: "contract.pdf",
              file_path: "documents/contracts/contract.pdf",
              document_type: "contract",
              uploaded_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
            }
          ];
          setDocuments(mockDocs);
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('uploaded_by', session.user.id)
          .order('uploaded_at', { ascending: false });
          
        if (error) {
          throw new Error("Failed to fetch documents");
        }
        
        setDocuments(data || []);
      } catch (error: any) {
        console.error("Error fetching documents:", error);
        setError(error.message || "Failed to load documents");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load documents"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [session, toast]);
  
  // Format document type for display
  const formatDocumentType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid date";
    }
  };
  
  // Handle document download
  const handleDownload = async (document: Document) => {
    try {
      if (session?.user?.id === "demo-user-id") {
        toast({
          title: "Demo Mode",
          description: "File download is not available in demo mode"
        });
        return;
      }
      
      // Get download URL
      const { data, error } = await supabase
        .storage
        .from('documents')
        .createSignedUrl(document.file_path, 60);
        
      if (error) {
        throw new Error("Failed to generate download link");
      }
      
      // Open the URL in a new tab
      window.open(data.signedUrl, '_blank');
      
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error.message || "Failed to download the document"
      });
    }
  };
  
  // Handle document deletion
  const handleDelete = async (document: Document) => {
    try {
      if (session?.user?.id === "demo-user-id") {
        // Just remove from local state in demo mode
        setDocuments(docs => docs.filter(d => d.id !== document.id));
        toast({
          title: "Document deleted",
          description: "Document has been removed (demo mode)"
        });
        return;
      }
      
      // Delete from storage
      const { error: storageError } = await supabase
        .storage
        .from('documents')
        .remove([document.file_path]);
        
      if (storageError) {
        throw new Error("Failed to delete file from storage");
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);
        
      if (dbError) {
        throw new Error("Failed to remove document record");
      }
      
      // Update state
      setDocuments(docs => docs.filter(d => d.id !== document.id));
      
      toast({
        title: "Document deleted",
        description: "Document has been successfully removed"
      });
      
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: error.message || "Failed to delete the document"
      });
    }
  };
  
  return (
    <Card className="border-none shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="text-xl font-bold text-blue-800">
          Uploaded Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <p className="text-lg font-medium text-red-700 mb-2">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-blue-200 mb-4" />
            <p className="text-lg font-medium text-gray-500 mb-1">No documents yet</p>
            <p className="text-sm text-gray-400">Upload your first document using the form above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map(document => (
              <div 
                key={document.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start space-x-3 mb-3 sm:mb-0">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[200px] sm:max-w-[300px]">{document.file_name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="bg-slate-100">
                        {formatDocumentType(document.document_type)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(document.uploaded_at)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 sm:ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleDownload(document)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(document)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentList;
