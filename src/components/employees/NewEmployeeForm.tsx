import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const organizations = [
  "Market Cloud Ltd, London, UK",
  "Saas Market Cloud Software Pvt. Ltd, India",
  "Market Cloud ScientiFix GmbH, Germany",
  "Market Cloud KFT, Hungary",
  "Market Cloud, UAE",
  "Market Cloud, Saudi Arabia",
  "Market Cloud, Qatar"
];

const currencies = [
  "GBP",
  "USD",
  "EUR",
  "INR",
  "SAR",
  "QAR",
  "AED"
];

const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  jobRole: z.string().min(1, "Job role is required"),
  organization: z.string().min(1, "Organization is required"),
  employmentType: z.enum(["fixed", "contractor"]),
  fixedSalary: z.string().optional(),
  contractorRate: z.string().optional(),
  rateType: z.enum(["hourly", "daily"]).optional(),
  currency: z.string().min(1, "Currency is required"),
  client: z.string().optional(),
  clientManager: z.string().optional(),
  employeeNumber: z.string().optional(),
  workLocation: z.string().min(1, "Work location is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
  postalAddress: z.string().min(1, "Postal address is required"),
  emailAddress: z.string().email("Invalid email address"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  homeNumber: z.string().optional(),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  agency: z.string().optional(),
  bankDetails: z.object({
    accountHolderName: z.string().min(1, "Account holder name is required"),
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    sortCode: z.string().optional(),
    ifscCode: z.string().optional(),
    ibanCode: z.string().optional(),
    swiftCode: z.string().optional(),
  }),
  emergencyContact: z.string().min(1, "Emergency contact details are required"),
});

type EmployeeValues = z.infer<typeof employeeSchema>;

const NewEmployeeForm = ({ onClose, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  
  const form = useForm<EmployeeValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employmentType: "fixed",
      rateType: "hourly",
      organization: organizations[0],
      currency: "USD",
      bankDetails: {
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        sortCode: "",
        ifscCode: "",
        ibanCode: "",
        swiftCode: "",
      }
    }
  });
  
  const employmentType = form.watch("employmentType");

  async function onSubmit(data: EmployeeValues) {
    try {
      setIsSubmitting(true);
      
      // For demo mode
      if (!session || session?.user?.email === 'admin@example.com') {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        toast({
          title: "Employee created",
          description: `${data.firstName} ${data.surname} has been added successfully.`,
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        return;
      }
      
      // Insert employee record
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          first_name: data.firstName,
          last_name: data.surname,
          role: data.jobRole,
          company_id: null, // Would link to companies table
          start_date: data.startDate.toISOString().split('T')[0],
          end_date: data.endDate ? data.endDate.toISOString().split('T')[0] : null,
          employee_number: data.employeeNumber,
          work_location: data.workLocation,
          postal_address: data.postalAddress,
          email: data.emailAddress,
          mobile_number: data.mobileNumber,
          home_number: data.homeNumber,
          date_of_birth: data.dateOfBirth.toISOString().split('T')[0],
          employment_type: data.employmentType,
        })
        .select()
        .single();
        
      if (employeeError) {
        throw new Error("Error creating employee: " + employeeError.message);
      }
      
      // Insert salary record
      const salaryData = {
        employee_id: employeeData.id,
        amount: data.employmentType === "fixed" 
          ? parseFloat(data.fixedSalary || "0") 
          : parseFloat(data.contractorRate || "0"),
        currency: data.currency,
        salary_type: data.employmentType === "fixed" 
          ? "monthly" 
          : data.rateType || "hourly",
        effective_from: data.startDate.toISOString().split('T')[0],
      };
      
      const { error: salaryError } = await supabase
        .from('salaries')
        .insert(salaryData);
        
      if (salaryError) {
        console.error("Error creating salary:", salaryError);
      }
      
      // Insert bank details
      const { error: bankError } = await supabase
        .from('bank_details')
        .insert({
          employee_id: employeeData.id,
          account_holder_name: data.bankDetails.accountHolderName,
          bank_name: data.bankDetails.bankName,
          account_number: data.bankDetails.accountNumber,
          sort_code: data.bankDetails.sortCode,
          ifsc_code: data.bankDetails.ifscCode,
          iban_code: data.bankDetails.ibanCode,
          swift_code: data.bankDetails.swiftCode,
          is_agency: data.employmentType === "contractor" && !!data.agency,
        });
        
      if (bankError) {
        console.error("Error creating bank details:", bankError);
      }
      
      // Insert employee details for additional fields
      const { error: detailsError } = await supabase
        .from('employee_details')
        .insert({
          employee_id: employeeData.id,
          emergency_contact_name: data.emergencyContact.split(',')[0]?.trim(),
          emergency_contact_number: data.emergencyContact.split(',')[1]?.trim(),
          emergency_contact_relation: data.emergencyContact.split(',')[2]?.trim(),
          agency_company: data.agency,
        });
        
      if (detailsError) {
        console.error("Error creating employee details:", detailsError);
      }
      
      toast({
        title: "Employee created",
        description: `${data.firstName} ${data.surname} has been added successfully.`,
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Refresh page to show new employee
      window.location.reload();
      
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message || "There was an error creating the employee.",
      });
    } finally {
      setIsSubmitting(false);
      onClose?.();
    }
  }

  function handleCancel() {
    form.reset();
    onClose?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="personal" className="text-sm">Personal Info</TabsTrigger>
            <TabsTrigger value="employment" className="text-sm">Employment Details</TabsTrigger>
            <TabsTrigger value="banking" className="text-sm">Banking & Emergency</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Surname</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Doe" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-blue-800">Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal border-blue-200 hover:bg-blue-50",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="pointer-events-auto"
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emailAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="john.doe@example.com" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Mobile Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+1 234 567 890" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homeNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Home Number (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+1 234 567 890" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="postalAddress"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-blue-800">Postal Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter full postal address" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={() => setActiveTab("employment")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Next: Employment Details
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="employment" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="jobRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Job Role</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Software Engineer" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employeeNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Employee Number (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="EMP-001" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Organization</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-blue-200 focus:ring-blue-400">
                              <SelectValue placeholder="Select organization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {organizations.map((org) => (
                              <SelectItem key={org} value={org}>{org}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Work Location</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="London, UK" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-blue-800">Employment Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row space-y-0 space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="fixed" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Fixed Salary
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="contractor" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Contractor
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {employmentType === "fixed" ? (
                    <FormField
                      control={form.control}
                      name="fixedSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-800">Fixed Gross Salary Per Month</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2000" 
                              {...field}
                              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contractorRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-800">Contractor Rate</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="50" 
                                {...field} 
                                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rateType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-800">Rate Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="border-blue-200 focus:ring-blue-400">
                                  <SelectValue placeholder="Select rate type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hourly">Per Hour</SelectItem>
                                <SelectItem value="daily">Per Day</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-blue-200 focus:ring-blue-400">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-blue-800">Role Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal border-blue-200 hover:bg-blue-50",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {employmentType === "contractor" && (
                    <>
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-blue-800">Role End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal border-blue-200 hover:bg-blue-50",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="agency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-800">Agency or Ltd company (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Agency name" 
                                {...field} 
                                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Client (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Client name" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clientManager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Client Manager (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Client manager name" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab("personal")}
                className="border-gray-300"
              >
                Previous
              </Button>
              <Button 
                type="button" 
                onClick={() => setActiveTab("banking")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Next: Banking & Emergency
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="banking" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg text-blue-800 border-b pb-2">Bank Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="bankDetails.accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-800">Account Holder Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bankDetails.bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-800">Bank Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="HSBC Bank" 
                              {...field} 
                              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bankDetails.accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-800">Account Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="12345678" 
                              {...field} 
                              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bankDetails.sortCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-800">Sort Code (For UK)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="10-20-30" 
                              {...field} 
                              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bankDetails.ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-800">IFSC Code (For India)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="SBIN0000123" 
                              {...field} 
                              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bankDetails.ibanCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-800">IBAN Code (For Europe)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="DE89 3704 0044 0532 0130 00" 
                              {...field} 
                              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bankDetails.swiftCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-800">SWIFT Code (For International)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="BNPAFRPP" 
                              {...field} 
                              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <h3 className="font-semibold text-lg text-blue-800 border-b pb-2">Emergency Contact</h3>
                  
                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Emergency Contact</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Name, Contact Number, Relationship" 
                            {...field} 
                            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setActiveTab("employment")}
                className="border-gray-300"
              >
                Previous
              </Button>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : "Submit"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default NewEmployeeForm;
