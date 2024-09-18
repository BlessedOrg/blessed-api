import { createDashboardSidebarCategoriesAndFields } from "@/components/createDashboard/createDashboardSidebarFields/createDashboardSidebarCategoriesAndFields";
import { Card } from "@/components/Card";

export const CreateDashboardContent = ({ selectedTab, form }) => {
  const { register } = form;
  return (
    <div className="w-full flex flex-col gap-10 pb-10">
      {createDashboardSidebarCategoriesAndFields.flatMap((category) =>
        category.tabs.flatMap((tab) =>
          tab?.customFieldComponents?.map((Components, index) => {
            return (
              <Components
                key={index}
                form={form}
                fields={tab.fields}
                className={`${selectedTab === tab.href ? "" : "!hidden"}`}
              />
            );
          })
        )
      )}
      {createDashboardSidebarCategoriesAndFields.flatMap((category) =>
        category.tabs.flatMap((tab) =>
          tab.fields.map((field) => (
            <Card key={field.id} className={`${selectedTab === tab.href ? "" : "!hidden"}`}>
              <div>
                <div className="mb-2 block">
                  <label htmlFor={field.id} color="gray">
                    {field.name}
                  </label>
                </div>
                <input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  {...register(field.id)}
                />
              </div>
            </Card>
          ))
        )
      )}
    </div>
  );
};
