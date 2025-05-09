
import { useEffect } from "react";
import DocumentUploader from "@/components/documents/DocumentUploader";

const Documents = () => {
  // Initialize storage bucket if needed
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Skip this if we know the bucket already exists
        // This is just a safeguard for demo/development
        const { error } = await fetch('https://pufxogvzyppvccxafxtx.supabase.co/storage/v1/bucket/documents', {
          method: 'HEAD'
        }).then(response => {
          if (!response.ok && response.status === 404) {
            throw new Error("Bucket does not exist");
          }
          return { error: null };
        });
        
        // If bucket doesn't exist, create it (would typically be done in migrations)
        if (error) {
          console.log("Documents bucket might not exist, would create it here");
        }
      } catch (error) {
        console.error("Storage check error:", error);
      }
    };
    
    initializeStorage();
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold tracking-tight text-purple-800">Documents</h2>
        <p className="text-purple-600">
          Upload and manage employee documents and records
        </p>
      </div>

      <DocumentUploader />
    </div>
  );
};

export default Documents;
