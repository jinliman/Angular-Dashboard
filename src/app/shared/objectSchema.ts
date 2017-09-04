export class Name{
  First: string;
  Last: string;
  Fullname: string;
  JobTitle: string;
}

export class Company{
  Name: string;
  Contact: string;
  ZipCode: string;
  Country: string;
  AboutUs: string;
  Industry: string;
  Diligence: string;
}

export class Reason1{
  tCompanyName: string;
  tIndustry: string;
  tEmpNo: number;
  tAnnualRev: number;
  tAcqDate: string;
}

export class Reason2{
  tEmpNo: number;
  tAnnualRev: number;
  tNetIncome: number;
  tSellDate: string
}

export class Reason3{
  tBizImp: boolean;
  tCostSaving: boolean;
  tPerformanceDate: boolean;
  tResOpt: boolean
}
export class Reason4{
  tReason: string
}

export class User{
  UserType: string;
  ProjectID: string;
  Email: string;
  Password: string;
  PasswordConfirm: string;
  Name: Name;
  Company: Company;
  Reason: number;
  Reason1: Reason1;
  Reason2: Reason2;
  Reason3: Reason3;
  Reason4: Reason4;
}

export class Question{
  UUID: string;
  Type: string;
  Order: string;
  Label: string;
  Items: [{
       UUID    : string;
       Order   : string;
       Text    : string;
   }]
}

export class Category{
  uuid			: string;
	Title			: string;
	Desc			: string;
	hasChildren	: boolean;
	expanded		: boolean;
	Questions 	: Array<object>;
}
