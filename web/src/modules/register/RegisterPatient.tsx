import { useState } from "react";
import { Link } from "@tanstack/react-router";

import ConsentsPatient from "~/components/Consents/ConsentsPatient";
import usePatient from "./usePatient";
import { ResponseData } from "~/models/system";

export default function RegisterPatient(props: ResponseData) {
  const { data } = props;
  const { form, errors, isLoading, handleConsent, handleChange, handleSubmit } =
    usePatient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTriggerModal = () => {
    setIsModalOpen(true);
  };

  const handleModalConsent = (isConsent: boolean) => {
    handleConsent(isConsent);
    setIsModalOpen(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="flex flex-col gap-1 lg:gap-4"
    >
      <div className="flex flex-col gap-1 lg:gap-4">
        <h1 className="font-semibold">Personal Information</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 [&>input]:w-full">
            <div>
              <input
                className="input w-full"
                type="text"
                placeholder="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              {errors?.name && (
                <span className="mt-2 text-sm text-error">
                  {errors.name[0]}
                </span>
              )}
            </div>
            <div>
              {data && (
                <select
                  className="select w-full"
                  name="diagnosis_id"
                  value={form.diagnosis_id}
                  onChange={handleChange}
                >
                  <option value="">Select Diagnosis</option>
                  {data.map((diagnosis: any) => (
                    <option key={diagnosis.id} value={diagnosis.id}>
                      {diagnosis.label}
                    </option>
                  ))}
                </select>
              )}
              {errors?.diagnosis_id && (
                <span className="mt-2 text-sm text-error">
                  {errors.diagnosis_id[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 lg:gap-4">
        <h1 className="font-semibold">Account</h1>
        <div className="flex flex-col gap-4 [&>input]:w-full">
          <div>
            <input
              className="input w-full"
              type="email"
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            {errors?.email && (
              <span className="mt-2 text-sm text-error">{errors.email[0]}</span>
            )}
          </div>
          <input
            className="input w-full"
            type="password"
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <div>
            <input
              className="input w-full"
              type="password"
              placeholder="Confirm Password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
            />
            {errors?.password && (
              <span className="mt-2 text-sm text-error">
                {errors.password[0]}
              </span>
            )}
            {errors?.password && errors.password[1] && (
              <span className="mt-2 text-sm text-error">
                {errors.password[1]}
              </span>
            )}
          </div>
        </div>

        <div className="w-full">
          <label className="mt-4 flex justify-center items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              name="consent"
              checked={form.consent || false}
              readOnly
            />
            <span
              className="text-sm link link-hover"
              onClick={handleTriggerModal}
            >
              Read the terms and conditions before consenting.
            </span>
          </label>
          {errors?.consent && (
            <span className="mt-2 text-sm text-error text-center">
              {errors.consent[0]}
            </span>
          )}
          {isModalOpen && (
            <ConsentsPatient
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAgree={handleModalConsent}
            />
          )}
        </div>
      </div>
      <button className="btn btn-primary mt-4" disabled={isLoading}>
        Submit
      </button>
      <Link className="mx-auto" to="/login">
        I already have an account.{" "}
        <span className="link link-hover">Login here.</span>
      </Link>
    </form>
  );
}
