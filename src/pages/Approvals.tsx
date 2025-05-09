
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApprovalList from "@/components/approvals/ApprovalList";

const Approvals = () => {
  const navigate = useNavigate();
  
  // Handle approval redirect from dashboard
  useEffect(() => {
    const handleApprovalRedirect = () => {
      const params = new URLSearchParams(window.location.search);
      const approvalId = params.get("id");
      
      if (approvalId) {
        // Find the approval card element by data-id attribute
        const approvalElement = document.querySelector(`[data-id="${approvalId}"]`);
        
        if (approvalElement) {
          // Scroll to the approval element
          approvalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Highlight the element temporarily
          approvalElement.classList.add('highlight-pulse');
          setTimeout(() => {
            approvalElement.classList.remove('highlight-pulse');
          }, 3000);
        }
        
        // Remove the query parameter from the URL
        navigate("/approvals", { replace: true });
      }
    };
    
    handleApprovalRedirect();
  }, [navigate]);
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-3xl font-bold tracking-tight text-purple-800">Approvals</h2>
        <p className="text-purple-600">
          Review and manage approval requests from employees
        </p>
      </div>

      <ApprovalList />
      
      {/* Add CSS for approval item highlighting */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .highlight-pulse {
          animation: pulse 1.5s ease-in-out 2;
          box-shadow: 0 0 0 10px rgba(124, 58, 237, 0.2);
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(124, 58, 237, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0);
          }
        }
        `
      }} />
    </div>
  );
};

export default Approvals;
