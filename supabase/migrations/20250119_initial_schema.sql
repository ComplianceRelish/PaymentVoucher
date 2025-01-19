-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'requester', 'approver')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create account_heads table
CREATE TABLE IF NOT EXISTS public.account_heads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.account_heads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Account heads viewable by authenticated users"
    ON public.account_heads FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Account heads manageable by admins"
    ON public.account_heads FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.active = true
        )
    );

-- Create payment_vouchers table
CREATE TABLE IF NOT EXISTS public.payment_vouchers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    voucher_number TEXT NOT NULL UNIQUE,
    date TIMESTAMPTZ NOT NULL,
    payee TEXT NOT NULL,
    account_head_id UUID REFERENCES public.account_heads(id),
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    requested_by UUID REFERENCES auth.users(id) NOT NULL,
    requested_date TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID REFERENCES auth.users(id),
    approved_date TIMESTAMPTZ,
    rejected_by UUID REFERENCES auth.users(id),
    rejected_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.payment_vouchers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Payment vouchers viewable by authenticated users"
    ON public.payment_vouchers FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Payment vouchers creatable by requesters"
    ON public.payment_vouchers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('requester', 'admin')
            AND profiles.active = true
        )
    );

CREATE POLICY "Payment vouchers approvable by approvers"
    ON public.payment_vouchers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('approver', 'admin')
            AND profiles.active = true
        )
    );

-- Create functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'requester');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
