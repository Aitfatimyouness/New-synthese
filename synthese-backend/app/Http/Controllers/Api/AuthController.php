<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::with('roles.permissions')->where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password) || $user->status !== 'actif') {
            return response()->json(['message' => 'Identifiants incorrects.'], 422);
        }

        $plainToken = Str::random(80);
        $user->tokens()->create([
            'name' => 'ofppt-web',
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addHours(12),
        ]);

        return response()->json([
            'token' => $plainToken,
            'user' => $this->serializeUser($user),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $this->serializeUser($request->user()->load('roles.permissions'))]);
    }

    public function logout(Request $request)
    {
        $plainToken = $request->bearerToken();

        if ($plainToken) {
            ApiToken::where('token', hash('sha256', $plainToken))->delete();
        }

        return response()->json(['message' => 'Déconnexion effectuée.']);
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email', 'exists:users,email']]);
        $plainToken = Str::upper(Str::random(6));

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $data['email']],
            ['token' => Hash::make($plainToken), 'created_at' => now()]
        );

        return response()->json([
            'message' => 'Code de réinitialisation généré. En production, il est envoyé par email.',
            'demo_reset_code' => $plainToken,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $data['email'])->first();

        if (! $record || ! Hash::check($data['token'], $record->token)) {
            return response()->json(['message' => 'Code de réinitialisation invalide.'], 422);
        }

        User::where('email', $data['email'])->update(['password' => Hash::make($data['password'])]);
        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

        return response()->json(['message' => 'Mot de passe mis à jour.']);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'matricule' => $user->matricule,
            'profile_title' => $user->profile_title,
            'roles' => $user->roles->map(fn ($role) => [
                'name' => $role->name,
                'label' => $role->label,
                'permissions' => $role->permissions->pluck('name')->values(),
            ])->values(),
        ];
    }
}
