
import DocumentUploader from "@/components/documents/DocumentUploader";

const Documents = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        <p className="text-muted-foreground">
          Upload and manage employee documents and records
        </p>
      </div>

      <DocumentUploader />
    </div>
  );
};

export default Documents;
