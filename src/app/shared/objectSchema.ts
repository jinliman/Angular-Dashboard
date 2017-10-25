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
  Website: string;
  Address1: string;
  Address2: string;
  Country: string;
  State: string;
  City: string;
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
  tResOpt: boolean;
}
export class Reason4{
  tReason: string;
}

export class User{
  UserType: string;
  ProjectID: string;
  Email: string;
  Password: string;
  PasswordConfirm: string;
  Name: Name;
  ProjectName: string;
  Company: Company;
  Reason: number;
  Reason1: Reason1;
  Reason2: Reason2;
  Reason3: Reason3;
  Reason4: Reason4;
}

export class QuestionItem{
  uuid    : string;
  Text    : string;
  value   : any;
  appID   : number;
}

export class Question{
  uuid: string;
  Type: string;
  Label: string;
  value   : string;
  comment : string;
  Status: number;
  HasDocument: boolean;
  Items: Array<QuestionItem>
}
export class AnswerItem{
  uuid: string;
  value: any;
  appID: number;
}
export class Answer{
  uuid: string;
  value: string;
  comment: string;
  Status: string;
  Items: Array<AnswerItem>
}

export class Category{
  uuid			: string;
	Title			: string;
	Desc			: string;
  created_time: Date;
	hasChildren	: boolean;
	expanded		: boolean;
	Questions 	: Array<object>;
}
