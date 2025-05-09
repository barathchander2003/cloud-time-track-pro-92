import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const organizations = [
  { value: "market-cloud-uk", label: "Market Cloud Ltd, London, UK" },
  { value: "market-cloud-india", label: "Saas Market Cloud Software Pvt. Ltd, India" },
  { value: "market-cloud-germany", label: "Market Cloud ScientiFix GmbH, Germany" },
  { value: "market-cloud-hungary", label: "Market Cloud KFT, Hungary" },
  { value: "market-cloud-uae", label: "Market Cloud, UAE" },
  { value: "market-cloud-saudi", label: "Market Cloud, Saudi Arabia" },
  { value: "market-cloud-qatar", label: "Market Cloud, Qatar" },
];

const currencies = [
  { value: "GBP", label: "GBP - British Pound" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "SAR", label: "SAR - Saudi Riyal" },
  { value: "QAR", label: "QAR - Qatari Riyal" },
  { value: "AED", label: "AED - UAE Dirham" },
];

// Define form schema based on the candidate checklist requirements
const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  jobRole: z.string().min(1, "Job role is required"),
  organization: z.string().min(1, "Organization is required"),
  employmentType: z.enum(["fixed", "contractor"]),
  salaryAmount: z.string().min(1, "Amount is required"),
  contractorRateType: z.enum(["hourly", "daily"]).optional(),
  contractorRate: z.string().optional(),
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
  email: z.string().email("Invalid email address"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  homeNumber: z.string().optional(),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  agencyCompany: z.string().optional(),
  taxReference: z.string().optional(),
  agencyAddress: z.string().optional(),
  companyNumber: z.string().optional(),
  insurance: z.string().optional(),
  vatNumber: z.string().optional(),
  bankDetails: z.object({
    accountHolderName: z.string().min(1, "Account holder name is required"),
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    sortCode: z.string().optional(),
    ifscCode: z.string().optional(),
    ibanCode: z.string().optional(),
    swiftCode: z.string().optional()
  }),
  agencyBankDetails: z.object({
    accountHolderName: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    sortCode: z.string().optional(),
    ifscCode: z.string().optional(),
    ibanCode: z.string().optional(),
    swiftCode: z.string().optional()
  }).optional(),
  nationality: z.string().min(1, "Nationality is required"),
  workPermit: z.boolean().default(false),
  workPermitDetails: z.string().optional(),
  passportNumber: z.string().min(1, "Passport number is required"),
  passportExpiry: z.date({
    required_error: "Passport expiry date is required",
  }),
  pcStatus: z.enum(["personal", "company", "client"]),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    number: z.string().min(1, "Emergency contact number is required"),
    relationship: z.string().min(1, "Relationship is required")
  }),
  references: z.array(
    z.object({
      name: z.string().min(1, "Reference name is required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().min(1, "Phone number is required")
    })
  ).min(1, "At least one reference is required"),
  documents: z.object({
    passport: z.boolean().default(false),
    degree: z.boolean().default(false),
    previousContract: z.boolean().default(false),
    relievingLetter: z.boolean().default(false),
    bankProof: z.boolean().default(false),
    photo: z.boolean().default(false),
  }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

const EmployeeForm = () => {
  const [isContractor, setIsContractor] = useState(false);
  const { toast } = useToast();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employmentType: "fixed",
      pcStatus: "company",
      references: [{ name: "", email: "", phone: "" }],
      documents: {
        passport: false,
        degree: false,
        previousContract: false,
        relievingLetter: false,
        bankProof: false,
        photo: false,
      },
      bankDetails: {
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
      },
    },
  });

  // Watch for employment type changes
  const employmentType = form.watch("employmentType");

  // Update isContractor state when employment type changes
  useEffect(() => {
    setIsContractor(employmentType === "contractor");
  }, [employmentType]);

  const onSubmit = (values: EmployeeFormValues) => {
    console.log("Form submitted:", values);
    toast({
      title: "Employee added successfully",
      description: `${values.firstName} ${values.surname} has been added to the system.`,
    });
    // Here you would typically send the data to your API
  };

  const addReference = () => {
    const currentReferences = form.getValues("references");
    form.setValue("references", [...currentReferences, { name: "", email: "", phone: "" }]);
  };

  const removeReference = (index: number) => {
    const currentReferences = form.getValues("references");
    if (currentReferences.length > 1) {
      form.setValue(
        "references",
        currentReferences.filter((_, i) => i !== index)
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-slate-50 p-6 rounded-lg border mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
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
                  <FormLabel>Surname</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
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
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input placeholder="British" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border mb-6">
          <h2 className="text-xl font-semibold mb-4">Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="jobRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineer" {...field} />
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
                  <FormLabel>Organization</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.value} value={org.value}>
                          {org.label}
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
              name="employmentType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Employment Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <label htmlFor="fixed">Fixed Gross Salary</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="contractor" id="contractor" />
                        <label htmlFor="contractor">Contractor Rate</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isContractor ? (
              <FormField
                control={form.control}
                name="salaryAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fixed Gross Salary Per Month</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="contractorRateType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Contractor Rate Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hourly" id="hourly" />
                            <label htmlFor="hourly">Hourly Rate</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="daily" id="daily" />
                            <label htmlFor="daily">Daily Rate</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contractorRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contractor Rate</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50" {...field} />
                      </FormControl>
                      <FormDescription>
                        {form.watch("contractorRateType") === "hourly" ? "Per Hour" : "Per Day"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
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
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isContractor && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (for contractors)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
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
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border mb-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
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
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+44 7123 456789" {...field} />
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
                  <FormLabel>Home Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+44 1234 567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Location</FormLabel>
                  <FormControl>
                    <Input placeholder="London, UK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalAddress"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Postal Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="123 Main St, City, Country, Postcode"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border mb-6">
          <h2 className="text-xl font-semibold mb-4">Banking Details</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium mb-3">Personal Banking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankDetails.accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="HSBC" {...field} />
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
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" {...field} />
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
                      <FormLabel>Sort Code (For UK)</FormLabel>
                      <FormControl>
                        <Input placeholder="12-34-56" {...field} />
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
                      <FormLabel>IFSC Code (For India)</FormLabel>
                      <FormControl>
                        <Input placeholder="ABCD0123456" {...field} />
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
                      <FormLabel>IBAN Code (For Europe)</FormLabel>
                      <FormControl>
                        <Input placeholder="DE89 3704 0044 0532 0130 00" {...field} />
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
                      <FormLabel>SWIFT Code (For International)</FormLabel>
                      <FormControl>
                        <Input placeholder="HBUKGB4B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {isContractor && (
              <div>
                <h3 className="text-md font-medium mb-3">Agency Company Bank Details (For Contractors)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="agencyBankDetails.accountHolderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Agency Ltd" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agencyBankDetails.bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Barclays" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agencyBankDetails.accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="87654321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agencyBankDetails.sortCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Code (For UK)</FormLabel>
                        <FormControl>
                          <Input placeholder="65-43-21" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border mb-6">
          <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="emergencyContact.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContact.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+44 7123 456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContact.relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input placeholder="Spouse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border mb-6">
          <h2 className="text-xl font-semibold mb-4">References</h2>
          {form.watch("references").map((_, index) => (
            <div key={index} className="mb-6 p-4 border rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Reference {index + 1}</h3>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeReference(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`references.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Reference Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`references.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="reference@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`references.${index}.phone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+44 7123 456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addReference}>
            Add Another Reference
          </Button>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border mb-6">
          <h2 className="text-xl font-semibold mb-4">Required Documents</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Please confirm that you have the following documents ready to upload:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="documents.passport"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Passport Copy (PDF)</FormLabel>
                    <FormDescription>
                      Required for all candidates
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documents.degree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Degree Certificate</FormLabel>
                    <FormDescription>
                      Copy of your highest qualification
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documents.previousContract"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Previous Contract/Offer Letter</FormLabel>
                    <FormDescription>
                      From your most recent employment
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documents.relievingLetter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Previous Relieving Letter</FormLabel>
                    <FormDescription>
                      From your most recent employment
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documents.bankProof"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Bank Account Proof</FormLabel>
                    <FormDescription>
                      Letter from bank or statement showing account details
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documents.photo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Passport Size Photograph</FormLabel>
                    <FormDescription>
                      Recent passport-sized photo
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" size="lg">Add Employee</Button>
      </form>
    </Form>
  );
};

export default EmployeeForm;
