import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "PU Unicare API",
    version: "1.0.0",
    description: "REST API for Parul University Unicare facility management system.",
  },
  servers: [
    {
      url: "https://your-supabase-project.supabase.co/rest/v1",
      description: "Supabase REST API",
    },
  ],
  paths: {
    "/complaints": {
      get: {
        summary: "Get all complaints",
        description: "Fetch a list of all maintenance complaints.",
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Complaint" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new complaint",
        description: "Submit a new maintenance request.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ComplaintInput" },
            },
          },
        },
        responses: {
          "201": { description: "Complaint created" },
        },
      },
    },
    "/complaints?id=eq.{id}": {
      patch: {
        summary: "Update a complaint",
        description: "Update the status, priority, or details of a complaint.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          }
        ],
        responses: {
          "200": { description: "Complaint updated" },
        }
      }
    }
  },
  components: {
    schemas: {
      Complaint: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          complaint_number: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["pending", "in_progress", "completed", "closed"] },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          location: { type: "string" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      ComplaintInput: {
        type: "object",
        required: ["title", "description", "department_id", "location"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          department_id: { type: "string", format: "uuid" },
          category_id: { type: "string", format: "uuid" },
          location: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
        },
      }
    },
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "apikey",
      },
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    { ApiKeyAuth: [] },
    { BearerAuth: [] },
  ],
};

const ApiDocs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Developer API</h1>
            <p className="text-muted-foreground">Integrate PU Unicare with your ERP or external tools.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <SwaggerUI spec={swaggerSpec} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiDocs;
