
import { useEffect, useState } from "react";
import DocumentUploader from "@/components/documents/DocumentUploader";
import DocumentList from "@/components/documents/DocumentList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Documents = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Initialize storage bucket if needed
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setLoading(true);
        
        // Check if the documents bucket exists
        const { data: buckets, error: bucketsError } = await supabase
          .storage
          .listBuckets();
          
        if (bucketsError) {
          console.error("Error checking buckets:", bucketsError);
          return;
        }
        
        // Look for documents bucket
        const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
        
        if (!documentsBucket) {
          console.log("Documents bucket doesn't exist, creating it");
          
          // Create the documents bucket
          const { error: createError } = await supabase
            .storage
            .createBucket('documents', { public: true });
            
          if (createError) {
            console.error("Error creating documents bucket:", createError);
            toast({
              variant: "destructive",
              title: "Storage Error",
              description: "Could not initialize document storage. Please contact support."
            });
            return;
          }
          
          console.log("Documents bucket created successfully");
          toast({
            title: "Storage Ready",
            description: "Document storage has been initialized."
          });
        }
      } catch (error) {
        console.error("Storage initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeStorage();
  }, [toast]);
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold tracking-tight text-purple-800">Documents</h2>
        <p className="text-purple-600">
          Upload and manage employee documents and records
        </p>
      </div>

      <DocumentUploader />
      
      <DocumentList />
      
      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        </div>
      )}
    </div>
  );
};

export default Documents;
